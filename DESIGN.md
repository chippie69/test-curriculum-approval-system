โจทย์ที่ 1: Database Architecture & Raw Query Design
1. Database design
    1.1 ระบบบันทึกหลักสูตรและตรวจสอบสถานะวิชา (React + Node.js + PostgreSQL) สามารถออกแบบฐานข้อมูลให้รองรับเงื่อนไขของคุณได้ดังนี้ครับ โดยเราจะแยกสิทธิ์การทำงานผ่านตาราง roles และเก็บประวัติการอนุมัติผ่าน approval_logs เพื่อให้ระบบโปร่งใสและตรวจสอบย้อนหลังได้ง่าย

1. การออกแบบ Database Schema (Relational)📊 ตารางข้อมูล (Tables Definition)ชื่อตาราง (Table Name)หน้าที่ / ข้อมูลที่จัดเก็บPrimary Key (PK)Foreign Key (FK)rolesเก็บสิทธิ์ในระบบ (เช่น อาจารย์, เจ้าหน้าที่คณะ)id-usersเก็บข้อมูลผู้ใช้งานระบบ และเชื่อมโยงสิทธิ์idrole_id (อ้างอิง roles.id)coursesเก็บข้อมูลหลักสูตร/รายวิชา และสถานะปัจจุบันidcreated_by (อ้างอิง users.id)approval_logsเก็บประวัติการอนุมัติ เปลี่ยนสถานะ และความเห็น (Comments)idcourse_id, action_by

ความสัมพันธ์ระหว่างตาราง (Relations)
roles 1 : N users -> สิทธิ์ 1 สิทธิ์ สามารถมีผู้ใช้งานได้หลายคน

users 1 : N courses -> อาจารย์ 1 คน สามารถสร้างได้หลายรายวิชา

courses 1 : N approval_logs -> รายวิชา 1 วิชา สามารถมีประวัติการอนุมัติ/แก้ไขได้หลายครั้ง
2. คำสั่ง Raw SQL สำหรับสร้างตาราง (CREATE TABLE)
-- 1. สร้าง ENUM สำหรับเก็บสถานะของหลักสูตร/วิชา
CREATE TYPE course_status AS ENUM ('Draft', 'Pending Review', 'Approved', 'Rejected');

-- 2. สร้างตาราง Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL -- เช่น 'Teacher', 'Staff'
);

-- 3. สร้างตาราง Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 4. สร้างตาราง Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name_th VARCHAR(200) NOT NULL,
    course_name_en VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    status course_status DEFAULT 'Draft'::course_status,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- 5. สร้างตาราง Approval Logs (สำหรับเก็บประวัติ)
CREATE TABLE approval_logs (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    action_by INT NOT NULL, -- ผู้ที่ทำการเปลี่ยนสถานะ (อาจารย์ หรือ เจ้าหน้าที่)
    from_status course_status,
    to_status course_status NOT NULL,
    comments TEXT, -- เหตุผลการปฏิเสธ หรือหมายเหตุเพิ่มเติม
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE RESTRICT
);

3. Raw SQL Query สำหรับดึงข้อมูล Pending Review
SELECT 
    c.id AS course_id,
    c.course_code,
    c.course_name_th,
    c.course_name_en,
    c.status AS current_status,
    c.created_at AS submitted_at,
    u.id AS proposer_id,
    u.first_name AS proposer_first_name,
    u.last_name AS proposer_last_name,
    u.email AS proposer_email
FROM courses c
INNER JOIN users u ON c.created_by = u.id
WHERE c.status = 'Pending Review'
ORDER BY c.created_at ASC;

2. จงอธิบายวิธีป้องกันช่องโหว่ **SQL Injection (สำหรับ SQL)** ในการเขียนโค้ดเชื่อมต่อฐานข้อมูลโดยตรงโดยไม่ผ่าน ORM
=> การป้องกันช่องโหว่ SQL Injection เมื่อเขียน Node.js เชื่อมต่อกับ PostgreSQL โดยตรงผ่าน library pg (โดยไม่ใช้ ORM เช่น Sequelize หรือ Prisma) มีหลักการสำคัญที่สุดข้อเดียวคือ "ห้ามนำตัวแปรจากผู้ใช้งาน (User Input) ไปต่อสตริง (String Concatenation) เข้ากับคำสั่ง SQL โดยตรงเด็ดขาด"
ตัวอย่างที่ห้ามใช้
// ถ้า input.courseCode ถูกส่งมาเป็น " ' OR '1'='1 " จะทำให้ดึงข้อมูลออกมาได้หมด หรือโดนลบตารางได้
const query = `SELECT * FROM courses WHERE course_code = '${input.courseCode}' AND status = 'Draft'`;
const result = await pool.query(query);

แบบที่ปลอดภัย
const query = `
  SELECT * FROM courses 
  WHERE course_code = $1 AND status = $2
`;
// ส่งตัวแปรแยกไปในฐานะ Array ในพารามิเตอร์ตัวที่สอง
const values = [input.courseCode, 'Draft']; 

const result = await pool.query(query, values);

โจทย์ที่ 2: Container & Data Persistence

1. การคอนฟิก docker-compose.yml เพื่อทำ Data Persistence
จากไฟล์ที่คุณให้มา คุณได้ใส่คอนฟิกสำหรับ Data Persistence ไว้ถูกต้องแล้วครับ นั่นคือการใช้ Named Volumes ที่ชื่อ pgdata ผูกกับโฟลเดอร์เก็บข้อมูลของ PostgreSQL (/var/lib/postgresql/data) ซึ่งจะทำให้ข้อมูลไม่หายไปแม้คอนเทนเนอร์จะถูกสั่ง docker-compose down หรือลบออกไปก็ตาม

อย่างไรก็ตาม คอนฟิกเดิมของคุณมี จุดผิดพลาดร้ายแรงอยู่ 2 จุด ที่จะทำให้ระบบรันไม่ขึ้นหรือเชื่อมต่อฐานข้อมูลไม่ได้:

DB_HOST=localhost ในฝั่ง backend จะทำให้มันพยายามวิ่งหาฐานข้อมูลในตัวเอง ซึ่งจะหาไม่เจอ (Connection Refused) เพราะในโลกของ Docker Compose คอนเทนเนอร์ต้องคุยกันผ่าน ชื่อ Service (ในที่นี้คือ postgres-db)

ไม่มีตัวแปร POSTGRES_PASSWORD ในฝั่งฐานข้อมูล แต่ฝั่ง backend ส่ง DB_PASS=secretpassword ไป ทำให้รหัสผ่านไม่ตรงกัน

มีเครื่องหมาย - ว่างๆ อยู่ใน environment ของ backend ซึ่งจะทำให้ Syntax พัง

2. ความแตกต่างด้าน Resource Management: Native Driver (pg) vs ORMในการจัดการ Connection Pool (การจองและเปิดท่อเชื่อมต่อกับ Database ค้างไว้เพื่อหมุนเวียนใช้ใหม่) ทั้งสองแบบมีแนวคิดและการบริหารจัดการทรัพยากรที่แตกต่างกันดังนี้ครับ:1. การจัดการด้วยตนเองผ่าน Native Driver (ใช้ pg.Pool)เมื่อใช้ library pg ใน Node.js คุณจะต้องเป็นคนกำหนดค่าและควบคุมพฤติกรรมของ Pool ด้วยตัวเองทั้งหมดผ่าน Codeการควบคุมระดับสูงสุด (Granular Control): คุณสามารถกำหนดจำนวนท่อเชื่อมต่อที่ต่ำสุดและสูงสุด (min, max) และเวลาที่ยอมให้ท่อค้างอยู่ได้ตรงๆ (idleTimeoutMillis)ความเสี่ยงเรื่อง Connection Leak: เนื่องจากต้องสั่งเปิดและปิดด้วยมือ หากคุณเขียนโค้ดแล้วลืมสั่ง client.release() กลับคืนสู่ Pool ในบล็อก catch หรือหลังจาก Query เสร็จ ท่อนั้นจะถูกจองค้างไว้ตลอดกาล หากมี User เข้ามาใช้งานเรื่อยๆ ท่อจะเต็ม (max connections reached) และทำให้ Backend ล่มในที่สุดResource Predictability: ใช้ทรัพยากรหน่วยความจำ (RAM/CPU) ต่ำมาก เพราะไม่มี Layer อื่นมาคั่น โค้ดทำงานตรงไปตรงมาตามจำนวน Connection ที่เรากำหนดไว้เป๊ะๆ2. การปล่อยให้ ORM จัดการให้ (เช่น Sequelize, Prisma)ORM ส่วนใหญ่จะมี Built-in Connection Pooler อยู่ภายในตัว (เช่น Sequelize จะใช้ library generic-pool อยู่เบื้องหลัง)ความปลอดภัยจาก Connection Leak (Automated Management): ORM จะจัดการวงจรชีวิต (Lifecycle) ของ Connection ให้โดยอัตโนมัติ เมื่อคุณเรียกใช้คำสั่งผ่าน ORM มันจะไปหยิบคำสั่งจาก Pool มาทำงานให้ และเมื่อส่งข้อมูลเสร็จ มันจะ "คืนท่อ" ให้ Pool เองโดยอัตโนมัติ ลดโอกาสเกิดท่อเต็มจากความผิดพลาดของ DeveloperOverhead และพฤติกรรมที่มองไม่เห็น (Hidden Resources): ORM มักจะมีการสร้าง Connection เผื่อไว้ หรือมีกลไกตรวจสอบสถานะท่อ (Heartbeat/Keep-alive) เป็นระยะๆ ซึ่งกินทรัพยากร RAM/CPU ของระบบมากกว่าเล็กน้อยความยากในการจูนนิ่งระดับสูง: หากแอปพลิเคชันของคุณขยายใหญ่ขึ้นเป็นระดับ Microservices การปล่อยให้ ORM จัดการค่า Default เองอาจทำให้จำนวน Connection บานปลายจนฐานข้อมูลรับไม่ไหว (เพราะแต่ละ Instance ของ ORM จะพยายามแย่งกันจองตามค่าสถิติของตัวเอง)📊 ตารางเปรียบเทียบเชิงสรุปคุณสมบัติการจัดการเองด้วย Native Driver (pg)ปล่อยให้ ORM จัดการความกินขาดเรื่องความเร็ว⚡ สูงมาก (Lightweight ไม่มีความซับซ้อนคั่น)⏳ ช้ากว่าเล็กน้อย (มีกระบวนการแปลงคำสั่งเป็น SQL)ความปลอดภัยจากการเขียนโค้ดพลาด⚠️ ต่ำ (ถ้าลืมล้างท่อหรือคืนสิทธิ์ คอนเนคชันจะรั่วทันที)สูง (ระบบคืนทรัพยากรให้เองหลังจาก Query จบ)การใช้ทรัพยากรฝั่งเซิร์ฟเวอร์ต่ำและคาดเดาง่าย ตามที่เรา Configสูงกว่า เนื่องจากมีชุดคำสั่งจัดการภายในเพิ่มเข้ามา