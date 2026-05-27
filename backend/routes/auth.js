const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const bcrypt = require('bcrypt');

router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.password,
                u.first_name, 
                u.last_name, 
                u.email, 
                r.role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.username = $1;
        `;
        
        const result = await pool.query(sql, [username]);

        // ตรวจสอบว่ามียูสเซอร์นี้ไหม
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = result.rows[0];

        // 🌟 2. ใช้ bcrypt.compare() ตรวจสอบรหัสผ่านดิบ กับ รหัสผ่านที่แฮชใน Database
        // พารามิเตอร์: (รหัสผ่านดิบจากหน้าบ้าน, รหัสผ่านที่แฮชจาก Database)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 3. ลบพาสเวิร์ดแฮชออกจาก Object ก่อนส่งกลับหน้าบ้านเพื่อความปลอดภัย
        delete user.password;

        return res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: user
        });

    } catch (error) {
        console.error('Login error with bcrypt:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์หลังบ้าน' });
    }
});

module.exports = router;