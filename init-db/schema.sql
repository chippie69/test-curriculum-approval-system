CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name_th VARCHAR(255) NOT NULL,
    course_name_en VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    status VARCHAR(20) DEFAULT 'Pending Review' CHECK (status IN ('Draft', 'Pending Review', 'Approved', 'Rejected')),
    created_by INT REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS approval_logs (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    action_by INT REFERENCES users(id) ON DELETE RESTRICT,
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name) VALUES 
('teacher'),
('staff')
ON CONFLICT (role_name) DO NOTHING;

-- password123
INSERT INTO users (id, username, password, first_name, last_name, email, role_id) VALUES
(101, 'teacher_somchai', '$2b$10$X72k1b7pM2f9JzQ3wK9e7O5fG8vY6xR4eW3qZ2a1b0c9d8e7f6g5h', 'สมชาย', 'ใจดี', 'somchai@university.ac.th', (SELECT id FROM roles WHERE role_name = 'teacher')),
(102, 'teacher_somsri', '$2b$10$X72k1b7pM2f9JzQ3wK9e7O5fG8vY6xR4eW3qZ2a1b0c9d8e7f6g5h', 'สมศรี', 'เรียนเก่ง', 'somsri@university.ac.th', (SELECT id FROM roles WHERE role_name = 'teacher')),
(998, 'staff_wipa', '$2b$10$X72k1b7pM2f9JzQ3wK9e7O5fG8vY6xR4eW3qZ2a1b0c9d8e7f6g5h', 'วิภา', 'ตั้งใจทำงาน', 'wipa@university.ac.th', (SELECT id FROM roles WHERE role_name = 'staff')),
(999, 'staff_narong', '$2b$10$X72k1b7pM2f9JzQ3wK9e7O5fG8vY6xR4eW3qZ2a1b0c9d8e7f6g5h', 'ณรงค์', 'ตรวจเข้มข้น', 'narong@university.ac.th', (SELECT id FROM roles WHERE role_name = 'staff'))
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);

INSERT INTO courses (course_code, course_name_th, course_name_en, description, credits, status, created_by)
VALUES 
('01204223', 'การพัฒนาเว็บแอปพลิเคชัน', 'Web Application Development', 'เรียนรู้การเขียน Express และ React ร่วมกับ Docker', 3, 'Pending Review', 101),
('01204312', 'ระบบฐานข้อมูล', 'Database Systems', 'การออกแบบฐานข้อมูลแบบ Relational และการเขียน SQL Queries', 3, 'Pending Review', 102)
ON CONFLICT (course_code) DO NOTHING;