CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name_th VARCHAR(255) NOT NULL,
    course_name_en VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    status VARCHAR(20) DEFAULT 'Pending Review' CHECK (status IN ('Draft', 'Pending Review', 'Approved', 'Rejected')),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS approval_logs (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    action_by INT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO courses (course_code, course_name_th, course_name_en, description, credits, status, created_by)
VALUES 
('01204223', 'การพัฒนาเว็บแอปพลิเคชัน', 'Web Application Development', 'เรียนรู้การเขียน Express และ React ร่วมกับ Docker', 3, 'Pending Review', 101),
('01204312', 'ระบบฐานข้อมูล', 'Database Systems', 'การออกแบบฐานข้อมูลแบบ Relational และการเขียน SQL Queries', 3, 'Pending Review', 102)
ON CONFLICT (course_code) DO NOTHING;