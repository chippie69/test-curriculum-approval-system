# 🚀 Full-Stack Developer Assessment: Curriculum Management System (Raw Database Edition)

**กองบริการการศึกษา** **ตำแหน่งที่สมัคร:** นักวิชาการคอมพิวเตอร์ [Full-Stack Developer]  
**เวลาในการสอบรวม:** 4 ชั่วโมง (แนะนำ: ส่วนที่ 1 = 1 ชม. / ส่วนที่ 2 = 3 ชม.)

---

## 📌 คำชี้แจงทั่วไป (General Instructions)

1. การสอบนี้จัดขึ้นเพื่อวัดทักษะด้าน **System Design, Database Fundamentals (Raw Queries), การพัฒนา Full-Stack และ Containerization (Docker)**
2. **ข้อกำหนดพิเศษด้านฐานข้อมูล:** \* ผู้เข้าสอบสามารถเลือกใช้ฐานข้อมูลที่ถนัดได้ระหว่าง **SQL (PostgreSQL)** หรือ **NoSQL (MongoDB)** อย่างใดอย่างหนึ่ง
   - **ห้ามใช้ ORM / ODM ทุกชนิด** (เช่น TypeORM, Prisma, Mongoose, Sequelize) ให้ใช้เพียง **Native Driver (`pg` สำหรับ PostgreSQL หรือ `mongodb` สำหรับ MongoDB)** ในการเชื่อมต่อและจัดการฐานข้อมูลโดยตรงเท่านั้น หากตรวจพบการใช้ ORM ในพาร์ทปฏิบัติจะไม่คิดคะแนนในส่วนฐานข้อมูล
3. ให้สร้างไฟล์ชื่อ `DESIGN.md` ไว้ที่ Root Directory ของโปรเจกต์เพื่อพิมพ์ตอบคำถามในส่วนที่ 1

---

## 📝 ส่วนที่ 1: ข้อเขียนและการออกแบบสถาปัตยกรรม (สัดส่วนคะแนน: 20%)

_กรุณาพิมพ์คำตอบลงในไฟล์ `DESIGN.md` โดยอิงตามประเภทฐานข้อมูล (SQL หรือ NoSQL) ที่คุณเลือกใช้ในภาคปฏิบัติ_

### โจทย์ที่ 1: Database Architecture & Raw Query Design (เวลาที่แนะนำ: 40 นาที)

ระบบบันทึกหลักสูตรมีเงื่อนไขคือ: หลักสูตรประกอบไปด้วยรายวิชาจำนวนมาก และมีกระบวนการอนุมัติ 4 สถานะ คือ `Draft` -> `Pending Review` -> `Approved` หรือ `Rejected` โดยอาจารย์มีสิทธิ์สร้าง/แก้ไข (เฉพาะ Draft/Rejected) และเจ้าหน้าที่คณะมีสิทธิ์อนุมัติ/ปฏิเสธเท่านั้น

**คำถาม:**

1. Database design : เลือกอย่างไดอย่างหนึ่ง
   1.1 **หากคุณเลือก SQL (PostgreSQL):** จงออกแบบ **Database Schema (Relational/PostgreSQL)** ในรูปแบบของตาราง (Tables) พร้อมระบุ Primary Key, Foreign Key และความสัมพันธ์ (Relations) ระหว่างตารางต่างๆ (เช่น Users, Roles, Courses, ApprovalLogs) และเขียนคำสั่ง `CREATE TABLE` (Raw SQL) สำหรับสร้างตารางที่จำเป็น และเขียน Raw SQL Query ในการดึงข้อมูลวิชาที่มีสถานะ `Pending Review` พร้อมทั้งเชื่อมโยง (JOIN) ข้อมูลชื่อ-นามสกุลของผู้เสนอวิชานั้นออกมา
   1.2 **หากคุณเลือก NoSQL (MongoDB):** จงออกแบบโครงสร้าง JSON Schema ของ Documents ที่เกี่ยวข้อง (ระบุว่าเป็น Embedding หรือ Referencing พร้อมเหตุผลประกอบ) และเขียนคำสั่ง MongoDB Native Query (หรือ Aggregation Pipeline) ในการดึงข้อมูลวิชาที่มีสถานะ `Pending Review` พร้อมข้อมูลของผู้เสนอวิชา
2. จงอธิบายวิธีป้องกันช่องโหว่ **SQL Injection (สำหรับ SQL)** หรือ **NoSQL Injection (สำหรับ MongoDB)** ในการเขียนโค้ดเชื่อมต่อฐานข้อมูลโดยตรงโดยไม่ผ่าน ORM

### โจทย์ที่ 2: Container & Data Persistence (เวลาที่แนะนำ: 20 นาที)

"ในสภาพแวดล้อม Production คอนเทนเนอร์ของฐานข้อมูลมีโอกาสหยุดทำงานหรือถูกรีสตาร์ทเพื่ออัปเดตระบบ"

**คำถาม:**

1. คุณจะคอนฟิกไฟล์ `docker-compose.yml` อย่างไรเพื่อทำ **Data Persistence** ไม่ให้ข้อมูลหลักสูตรสูญหายเมื่อคอนเทนเนอร์ดับ (ระบุสคริปต์คอนฟิกของฐานข้อมูลที่คุณเลือก)
2. อธิบายความแตกต่างในแง่ของ Resource Management ระหว่างการจัดการ Connection Pool ด้วยตนเอง (เมื่อใช้ Native Driver) กับการปล่อยให้ ORM จัดการให้

---

## 💻 ส่วนที่ 2: ภาคปฏิบัติ (สัดส่วนคะแนน: 80%)

_ใน Starter Kit คณะกรรมการได้เตรียม Container ของทั้ง **PostgreSQL** และ **MongoDB** ไว้ใน Docker Compose ให้ผู้เข้าสอบเลือกเปิดใช้งานตัวที่ต้องการ และติดตั้ง Driver `pg` และ `mongodb` ไว้ให้ในฝั่ง Backend แล้ว_

### 🛠️ ภารกิจที่ 1: พัฒนาฝั่งหลังบ้านด้วย Native Driver (Backend Tasks)

ให้พัฒนา API ต่อยอดในโฟลเดอร์ `/backend` (TypeScript/Node.js, GoLang, python) โดยเขียนติดต่อฐานข้อมูลตรงๆ ผ่าน Native Driver:

1. **Create Course API (`POST /api/courses`):**
   - รับข้อมูลวิชาใหม่ (รหัสวิชา, ชื่อวิชา, คำอธิบาย, หน่วยกิต) ลงฐานข้อมูล
   - **Data Validation & Security:** ต้องตรวจสอบไม่ให้รหัสวิชาซ้ำ และหน่วยกิตต้องมากกว่า 0 โดยการเขียน Query ไปเช็คในฐานข้อมูลด้วยตนเอง และ**ต้องใช้ Parameterized Queries (หรือ Sanitized Input)** เพื่อความปลอดภัย
2. **Review Course API (`PATCH /api/courses/:id/status`):**
   - อัปเดตสถานะเป็น `Approved` หรือ `Rejected` (ถ้า Rejected ต้องบันทึกเหตุผลลงไปด้วย) โดยเขียนคำสั่งอัปเดตตรงไปยังฐานข้อมูล

### 🛠️ ภารกิจที่ 2: พัฒนาฝั่งหน้าบ้าน (Frontend Tasks - React/NextJs)

ให้พัฒนาหน้าจอผู้ใช้งานในโฟลเดอร์ `/frontend-react or /frontend-nextjs`:

1. **Staff Dashboard Page:** ดึงข้อมูลรายวิชาที่มีสถานะ `Pending Review` ทั้งหมดจาก API มาแสดงผลในรูปแบบตารางหรือการ์ดให้ชัดเจนสวยงาม
2. **Interactive Action & Smooth UX:** มีปุ่ม **[อนุมัติ]** และ **[ส่งกลับแก้ไข]** (ถ้าส่งกลับแก้ไขต้องมี Modal ให้กรอกเหตุผล) เมื่อกดยืนยัน ระบบต้องยิง API อัปเดตหลังบ้าน และทำ Re-fetch Data เพื่ออัปเดต UI ทันที **ห้ามใช้วิธีรีเฟรชหน้าจอเบราว์เซอร์**

### 🛠️ ภารกิจที่ 3: บรรจุระบบลงคอนเทนเนอร์ (Docker Integration)

1. **Dockerfile:** เขียนไฟล์ `Dockerfile` สำหรับ Backend โดยใช้เทคนิค **Multi-stage Build** เพื่อตัด Dependencies ที่ใช้คอมไพล์ TypeScript ออก ให้เหลือเฉพาะ Production Build
2. **Fix Docker Compose:** แก้ไขจุดบกพร่องในไฟล์ `docker-compose.yml` (เช่น การตั้งค่าพอร์ต, Network, หรือ Environment Variables สำหรับการต่อฐานข้อมูลแบบ Raw ให้ถูกต้อง) เพื่อให้พิมพ์คำสั่ง `docker compose up --build` แล้วทุกบริการเชื่อมต่อกันได้ทันที

---

## 📊 เกณฑ์การตรวจคะแนน (Grading Rubric)

| หัวข้อการประเมิน                      | สัดส่วนคะแนน | สิ่งที่คณะกรรมการจะตรวจสอบและให้คะแนน                                                                                                         |
| :------------------------------------ | :----------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **Functional Correctness**            |     40%      | ระบบทำงานได้ถูกต้องตาม Business Flow, ข้อมูลบันทึกและอัปเดตลง DB จริงได้ถูกต้อง, UI/UX ลื่นไหล                                                |
| **Database & Security Fundamentals**  |     25%      | **ไม่ใช้ ORM**, การใช้ Native Driver ได้ถูกต้อง, มีการทำ Parameterized Query เพื่อป้องกัน Injection, การจัดการ Close/Release Connection ที่ดี |
| **Docker Integration & Code Quality** |     25%      | Dockerfile เป็น Multi-stage Build, Docker Compose รันขึ้นจริงในคำสั่งเดียว, โค้ดสะอาดและมีการจัดการ Error Handling ที่ครอบคลุม                |
| **Git Hygiene**                       |     10%      | ความถี่ในการ Commit งานอย่างเป็นระบบ และความชัดเจนในการเขียน Commit Message                                                                   |

---

## 📥 แนวทางการส่งงาน (Submission Guidelines)

1. Commit โค้ดลง Local Git เป็นระยะๆ (ห้าม Commit รวบยอดทีเดียว)
2. ตรวจสอบให้แน่ใจว่าเขียนคำตอบข้อเขียนลงในไฟล์ `DESIGN.md` แล้ว
3. push ขึ้น Git repositrory ที่ได้รับ
4. บีบอัดโฟลเดอร์โปรเจกต์ (ยกเว้น `node_modules` และ `dist`) เป็นไฟล์ `.zip` ตั้งชื่อ `Fullstack_Exam_[ชื่อ_นามสกุล].zip` ส่งกลับทางช่องทางที่กำหนด
