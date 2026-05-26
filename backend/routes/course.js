// routes/course.js
const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/courses/teacher/:teacher_id', async (req, res) => {
    try {
        const { teacher_id } = req.params;
        
        const sql = `
            SELECT 
                id AS course_id, 
                course_code, 
                course_name_th, 
                course_name_en, 
                credits,
                status,
                comments
            FROM courses 
            WHERE created_by = $1
            ORDER BY created_at DESC;
        `;
        
        const result = await pool.query(sql, [teacher_id]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติวิชา' });
    }
});

router.get('/courses/pending', async (req, res) => {
    try {
        // เขียน Query ดึงวิชาที่สถานะเป็น Pending Review ออกมาเรียงตามเวลาล่าสุด
        const sql = `
            SELECT 
                id AS course_id, 
                course_code, 
                course_name_th, 
                course_name_en, 
                credits,
                created_by,
                'อาจารย์ สมชาย ใจดี' AS proposer_first_name, -- สมมติชื่ออาจารย์ไว้ก่อนชั่วคราว
                '' AS proposer_last_name,
                'somchai@university.ac.th' AS proposer_email
            FROM courses 
            WHERE status = 'Pending Review'
            ORDER BY created_at DESC;
        `;
        
        const result = await pool.query(sql);
        
        // ส่งข้อมูลกลับไปให้หน้าบ้าน React ในรูปแบบ Array JSON
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error fetching pending courses:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล' });
    }
});

router.post('/courses', async (req, res) => {
    // 🌟 1. ดึงตัวแปร status เพิ่มเข้ามาจาก req.body ด้วย
    const { course_code, course_name_th, course_name_en, description, credits, created_by, status } = req.body;

    if (!course_code || !course_name_th || !course_name_en || !credits || !created_by) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    if (parseInt(credits) <= 0) {
        return res.status(400).json({ message: 'หน่วยกิตต้องมีค่ามากกว่า 0' });
    }

    try {
        const checkDuplicateSql = 'SELECT id FROM courses WHERE course_code = $1';
        const duplicateCheck = await pool.query(checkDuplicateSql, [course_code]);

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ message: 'รหัสวิชานี้มีอยู่ในระบบแล้ว' });
        }

        // 🌟 2. เพิ่มคอลัมน์ status และใส่ค่าพารามิเตอร์ $7 ลงไป
        const insertSql = `
            INSERT INTO courses (course_code, course_name_th, course_name_en, description, credits, created_by, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        // หากหน้าบ้านไม่ส่งสถานะมา ให้ดีฟอลต์เซ็ตเป็น 'Pending Review' เผื่อไว้ครับ
        const values = [course_code, course_name_th, course_name_en, description, credits, created_by, status || 'Pending Review'];
        
        const result = await pool.query(insertSql, values); 

        return res.status(201).json({
            message: 'สร้างรายวิชาสำเร็จ',
            course: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
});

router.patch('/courses/:id/status', async (req, res) => {
    const courseId = req.params.id;
    const { status, action_by, comments } = req.body; // action_by คือ ID ของเจ้าหน้าที่

    // --- 1. Validation เบื้องต้น ---
    const allowedStatuses = ['Approved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'สถานะไม่ถูกต้อง (ต้องเป็น Approved หรือ Rejected เท่านั้น)' });
    }

    if (!action_by) {
        return res.status(400).json({ message: 'ไม่พบข้อมูลผู้ดำเนินการ' });
    }

    if (status === 'Rejected' && (!comments || comments.trim() === '')) {
        return res.status(400).json({ message: 'กรุณาระบุเหตุผลกรณีปฏิเสธหลักสูตร (Rejected)' });
    }

    // เปิดการเชื่อมต่อแบบดึง Client ออกมาจาก Pool โดยตรงเพื่อทำ Transaction
    const client = await pool.connect();

    try {
        // เริ่มต้น Transaction
        await client.query('BEGIN');

        // --- 2. ดึงสถานะปัจจุบันของวิชานั้นออกมาก่อนเพื่อตรวจสอบเงื่อนไขความปลอดภัย ---
        const checkCurrentSql = 'SELECT status FROM courses WHERE id = $1 FOR UPDATE'; 
        // (FOR UPDATE เพื่อ Lock Row นี้ไว้ชั่วคราว ป้องกันคนกดพร้อมกันแล้วข้อมูลเพี้ยน)
        const currentResult = await client.query(checkCurrentSql, [courseId]);

        if (currentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'ไม่พบรายวิชาที่ระบุ' });
        }

        const currentStatus = currentResult.rows[0].status;

        // เฉพาะวิชาที่มีสถานะ 'Pending Review' เท่านั้นที่สามารถกดอนุมัติหรือปฏิเสธได้
        if (currentStatus !== 'Pending Review') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'ไม่สามารถอนุมัติวิชานี้ได้ เนื่องจากไม่ได้อยู่ในสถานะรอตรวจ' });
        }

        // --- 3. อัปเดตสถานะวิชาในตาราง courses ---
        const updateCourseSql = `
            UPDATE courses 
            SET 
                status = $1, 
                comments = $2, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING *;
        `;
        // สลับส่งตัวแปรให้เรียงตรงตามพารามิเตอร์ [status, comments, courseId]
        const updatedCourseResult = await client.query(updateCourseSql, [status, comments || null, courseId]);

        // --- 4. บันทึกประวัติลงตาราง approval_logs ---
        const insertLogSql = `
            INSERT INTO approval_logs (course_id, action_by, from_status, to_status, comments)
            VALUES ($1, $2, $3, $4, $5);
        `;
        await client.query(insertLogSql, [courseId, action_by, currentStatus, status, comments || null]);

        // จบ Transaction อย่างสมบูรณ์ ข้อมูลทั้งหมดถูกเซฟลงพร้อมกัน
        await client.query('COMMIT');

        return res.status(200).json({
            message: `ปรับปรุงสถานะเป็น ${status} เรียบร้อยแล้ว`,
            course: updatedCourseResult.rows[0]
        });

    } catch (error) {
        // หากเกิดอะไรพังขึ้นมาระหว่างทาง สั่งยกเลิกทั้งหมดเพื่อไม่ให้ข้อมูลค้างคา
        await client.query('ROLLBACK');
        console.error('Error reviewing course:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบส่งผลให้ไม่สามารถบันทึกได้' });
    } finally {
        // 🌟 สำคัญที่สุด: คืน Client กลับเข้าสู่ Pool ทุกครั้ง ไม่เช่นนั้นท่อเชื่อมต่อจะรั่ว (Connection Leak)
        client.release();
    }
});

module.exports = router;