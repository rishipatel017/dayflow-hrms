-- DayFlow HRMS Database Schema
-- MySQL Database Creation and Initial Data
-- Generated: January 2026

-- Create Database
CREATE DATABASE IF NOT EXISTS dayflow_hrms;
USE dayflow_hrms;

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Company Information Table
CREATE TABLE company (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table (Core employee authentication and basic info)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE', 'MANAGER') NOT NULL DEFAULT 'EMPLOYEE',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Employee Profiles Table (Extended employee information)
CREATE TABLE employee_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    job_position VARCHAR(100),
    department VARCHAR(100),
    manager_id VARCHAR(50),
    bank_account_no VARCHAR(50),
    ifsc VARCHAR(11),
    pan VARCHAR(10),
    uan VARCHAR(12),
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
    nationality VARCHAR(50) DEFAULT 'Indian',
    date_of_birth DATE,
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_department (department),
    INDEX idx_manager (manager_id)
);

-- Salary Structure Table
CREATE TABLE salary_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    total_wage DECIMAL(10, 2) NOT NULL DEFAULT 0,
    yearly_wage DECIMAL(12, 2) NOT NULL DEFAULT 0,
    working_days_per_week INT DEFAULT 5,
    basic DECIMAL(10, 2) DEFAULT 0,
    hra DECIMAL(10, 2) DEFAULT 0,
    standard_allowance DECIMAL(10, 2) DEFAULT 0,
    performance_bonus DECIMAL(10, 2) DEFAULT 0,
    travel_allowance DECIMAL(10, 2) DEFAULT 0,
    fixed_allowance DECIMAL(10, 2) DEFAULT 0,
    pf_employee DECIMAL(10, 2) DEFAULT 0,
    pf_employer DECIMAL(10, 2) DEFAULT 0,
    prof_tax DECIMAL(10, 2) DEFAULT 0,
    effective_from DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Attendance Table
CREATE TABLE attendance (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    status ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE') NOT NULL DEFAULT 'PRESENT',
    work_hours DECIMAL(4, 2) DEFAULT 0,
    extra_hours DECIMAL(4, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_date (user_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    leave_type ENUM('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    approver_id VARCHAR(50),
    approval_date DATETIME,
    approver_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_approver (approver_id)
);

-- Leave Balance Table
CREATE TABLE leave_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    sick_leave INT DEFAULT 12,
    casual_leave INT DEFAULT 12,
    earned_leave INT DEFAULT 15,
    maternity_leave INT DEFAULT 180,
    paternity_leave INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_year (user_id, year),
    INDEX idx_user_year (user_id, year)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Company Data
INSERT INTO company (name) VALUES ('DayFlow Technologies');

-- Insert Users (Admin and Sample Employee)
INSERT INTO users (id, employee_id, email, password_hash, role, first_name, last_name, joining_date, profile_picture_url) VALUES
('u1', 'OIALAD20220001', 'admin@dayflow.com', 'admin123', 'ADMIN', 'Alice', 'Admin', '2022-01-01', 'https://i.pravatar.cc/150?u=u1'),
('u2', 'OIJODO20230001', 'john@dayflow.com', 'user123', 'EMPLOYEE', 'John', 'Doe', '2023-03-15', 'https://i.pravatar.cc/150?u=u2'),
('u3', 'OISASH20230002', 'sarah@dayflow.com', 'user123', 'MANAGER', 'Sarah', 'Smith', '2023-06-01', 'https://i.pravatar.cc/150?u=u3'),
('u4', 'OIMIJO20240001', 'mike@dayflow.com', 'user123', 'EMPLOYEE', 'Mike', 'Johnson', '2024-01-10', 'https://i.pravatar.cc/150?u=u4'),
('u5', 'OIEMTA20240002', 'emma@dayflow.com', 'user123', 'EMPLOYEE', 'Emma', 'Taylor', '2024-04-20', 'https://i.pravatar.cc/150?u=u5');

-- Insert Employee Profiles
INSERT INTO employee_profiles (user_id, address, phone, job_position, department, manager_id, bank_account_no, ifsc, pan, uan, marital_status, nationality) VALUES
('u1', '123 Admin Street, Mumbai', '9876543210', 'HR Manager', 'Human Resources', NULL, '123456789', 'HDFC0001', 'ABCDE1234F', '100000001', 'Single', 'Indian'),
('u2', '456 User Lane, Ahmedabad', '9876543211', 'Software Engineer', 'Engineering', 'u3', '987654321', 'SBIN0001', 'FGHIJ5678K', '100000002', 'Married', 'Indian'),
('u3', '789 Manager Road, Bangalore', '9876543212', 'Engineering Manager', 'Engineering', 'u1', '456789123', 'ICIC0001', 'KLMNO9012P', '100000003', 'Married', 'Indian'),
('u4', '321 Tech Park, Pune', '9876543213', 'Senior Developer', 'Engineering', 'u3', '789123456', 'HDFC0002', 'PQRST3456U', '100000004', 'Single', 'Indian'),
('u5', '654 Innovation Hub, Hyderabad', '9876543214', 'UI/UX Designer', 'Design', 'u1', '321654987', 'SBIN0002', 'VWXYZ7890A', '100000005', 'Single', 'Indian');

-- Insert Salary Structures
INSERT INTO salary_structures (user_id, total_wage, yearly_wage, working_days_per_week, basic, hra, standard_allowance, performance_bonus, travel_allowance, fixed_allowance, pf_employee, pf_employer, prof_tax, effective_from) VALUES
('u1', 80000.00, 960000.00, 5, 40000.00, 20000.00, 2000.00, 0.00, 1500.00, 16500.00, 4800.00, 4800.00, 200.00, '2022-01-01'),
('u2', 50000.00, 600000.00, 5, 25000.00, 12500.00, 2000.00, 0.00, 1500.00, 9000.00, 3000.00, 3000.00, 200.00, '2023-03-15'),
('u3', 95000.00, 1140000.00, 5, 47500.00, 23750.00, 2000.00, 0.00, 1500.00, 20250.00, 5700.00, 5700.00, 200.00, '2023-06-01'),
('u4', 65000.00, 780000.00, 5, 32500.00, 16250.00, 2000.00, 0.00, 1500.00, 12750.00, 3900.00, 3900.00, 200.00, '2024-01-10'),
('u5', 55000.00, 660000.00, 5, 27500.00, 13750.00, 2000.00, 0.00, 1500.00, 10250.00, 3300.00, 3300.00, 200.00, '2024-04-20');

-- Insert Sample Attendance Records (Current Month)
INSERT INTO attendance (id, user_id, date, check_in_time, check_out_time, status, work_hours, extra_hours) VALUES
('a1', 'u2', '2026-01-02', '2026-01-02 09:00:00', '2026-01-02 18:15:00', 'PRESENT', 9.25, 0.25),
('a2', 'u3', '2026-01-02', '2026-01-02 08:45:00', '2026-01-02 18:00:00', 'PRESENT', 9.25, 0.25),
('a3', 'u4', '2026-01-02', '2026-01-02 09:30:00', '2026-01-02 18:30:00', 'LATE', 9.00, 0.00),
('a4', 'u5', '2026-01-02', '2026-01-02 09:00:00', '2026-01-02 18:00:00', 'PRESENT', 9.00, 0.00),
('a5', 'u2', '2026-01-03', '2026-01-03 09:00:00', NULL, 'PRESENT', 0.00, 0.00);

-- Insert Sample Leave Requests
INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, days_count, reason, status, approver_id, approval_date) VALUES
('l1', 'u2', 'CASUAL', '2026-01-10', '2026-01-12', 3, 'Family function', 'APPROVED', 'u3', '2026-01-03 10:30:00'),
('l2', 'u4', 'SICK', '2026-01-15', '2026-01-16', 2, 'Medical appointment', 'PENDING', NULL, NULL),
('l3', 'u5', 'EARNED', '2026-02-05', '2026-02-10', 6, 'Vacation', 'PENDING', NULL, NULL);

-- Insert Leave Balances for 2026
INSERT INTO leave_balances (user_id, year, sick_leave, casual_leave, earned_leave, maternity_leave, paternity_leave) VALUES
('u1', 2026, 12, 12, 15, 0, 15),
('u2', 2026, 12, 9, 15, 0, 15),
('u3', 2026, 12, 12, 15, 0, 15),
('u4', 2026, 10, 12, 15, 0, 15),
('u5', 2026, 12, 12, 9, 180, 0);

-- =============================================
-- USEFUL QUERIES AND VIEWS
-- =============================================

-- View: Employee Full Details
CREATE VIEW employee_full_details AS
SELECT 
    u.id,
    u.employee_id,
    u.email,
    u.role,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.joining_date,
    ep.phone,
    ep.job_position,
    ep.department,
    ep.address,
    ss.total_wage,
    ss.yearly_wage,
    m.first_name AS manager_first_name,
    m.last_name AS manager_last_name
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN salary_structures ss ON u.id = ss.user_id
LEFT JOIN users m ON ep.manager_id = m.id
WHERE u.is_active = TRUE;

-- View: Current Month Attendance Summary
CREATE VIEW monthly_attendance_summary AS
SELECT 
    u.employee_id,
    CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
    COUNT(a.id) AS days_present,
    SUM(a.work_hours) AS total_work_hours,
    SUM(a.extra_hours) AS total_extra_hours,
    AVG(a.work_hours) AS avg_work_hours
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id 
    AND YEAR(a.date) = YEAR(CURDATE()) 
    AND MONTH(a.date) = MONTH(CURDATE())
WHERE u.is_active = TRUE
GROUP BY u.id, u.employee_id, u.first_name, u.last_name;

-- View: Pending Leave Requests
CREATE VIEW pending_leave_requests AS
SELECT 
    lr.id,
    CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
    u.employee_id,
    ep.department,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    lr.days_count,
    lr.reason,
    lr.created_at
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
JOIN employee_profiles ep ON u.id = ep.user_id
WHERE lr.status = 'PENDING'
ORDER BY lr.created_at ASC;

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure: Generate Employee ID
DELIMITER //
CREATE PROCEDURE generate_employee_id(
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_joining_date DATE,
    OUT p_employee_id VARCHAR(50)
)
BEGIN
    DECLARE v_year INT;
    DECLARE v_count INT;
    DECLARE v_serial VARCHAR(4);

    SET v_year = YEAR(p_joining_date);

    SELECT COUNT(*) + 1 INTO v_count
    FROM users
    WHERE YEAR(joining_date) = v_year;

    SET v_serial = LPAD(v_count, 4, '0');

    SET p_employee_id = CONCAT(
        'OI',
        UPPER(SUBSTRING(p_first_name, 1, 2)),
        UPPER(SUBSTRING(p_last_name, 1, 2)),
        v_year,
        v_serial
    );
END //

-- Procedure: Calculate Salary Structure
CREATE PROCEDURE calculate_salary_structure(
    IN p_user_id VARCHAR(50),
    IN p_total_wage DECIMAL(10, 2)
)
BEGIN
    DECLARE v_basic DECIMAL(10, 2);
    DECLARE v_hra DECIMAL(10, 2);
    DECLARE v_standard_allowance DECIMAL(10, 2);
    DECLARE v_pf_employee DECIMAL(10, 2);
    DECLARE v_pf_employer DECIMAL(10, 2);
    DECLARE v_prof_tax DECIMAL(10, 2);
    DECLARE v_fixed_allowance DECIMAL(10, 2);
    DECLARE v_yearly_wage DECIMAL(12, 2);

    SET v_basic = p_total_wage * 0.50;
    SET v_hra = v_basic * 0.50;
    SET v_standard_allowance = 2000.00;
    SET v_pf_employee = v_basic * 0.12;
    SET v_pf_employer = v_basic * 0.12;
    SET v_prof_tax = 200.00;
    SET v_fixed_allowance = GREATEST(0, p_total_wage - (v_basic + v_hra + v_standard_allowance));
    SET v_yearly_wage = p_total_wage * 12;

    INSERT INTO salary_structures (
        user_id, total_wage, yearly_wage, working_days_per_week,
        basic, hra, standard_allowance, fixed_allowance,
        pf_employee, pf_employer, prof_tax, effective_from
    ) VALUES (
        p_user_id, p_total_wage, v_yearly_wage, 5,
        v_basic, v_hra, v_standard_allowance, v_fixed_allowance,
        v_pf_employee, v_pf_employer, v_prof_tax, CURDATE()
    )
    ON DUPLICATE KEY UPDATE
        total_wage = p_total_wage,
        yearly_wage = v_yearly_wage,
        basic = v_basic,
        hra = v_hra,
        standard_allowance = v_standard_allowance,
        fixed_allowance = v_fixed_allowance,
        pf_employee = v_pf_employee,
        pf_employer = v_pf_employer,
        prof_tax = v_prof_tax,
        effective_from = CURDATE();
END //

-- Procedure: Process Check-In
CREATE PROCEDURE process_check_in(
    IN p_user_id VARCHAR(50)
)
BEGIN
    DECLARE v_today DATE;
    DECLARE v_attendance_id VARCHAR(50);

    SET v_today = CURDATE();
    SET v_attendance_id = CONCAT('a', UNIX_TIMESTAMP());

    INSERT INTO attendance (id, user_id, date, check_in_time, status)
    SELECT v_attendance_id, p_user_id, v_today, NOW(), 'PRESENT'
    WHERE NOT EXISTS (
        SELECT 1 FROM attendance 
        WHERE user_id = p_user_id AND date = v_today
    );
END //

-- Procedure: Process Check-Out
CREATE PROCEDURE process_check_out(
    IN p_user_id VARCHAR(50)
)
BEGIN
    DECLARE v_today DATE;
    DECLARE v_work_hours DECIMAL(4, 2);
    DECLARE v_extra_hours DECIMAL(4, 2);

    SET v_today = CURDATE();

    UPDATE attendance
    SET 
        check_out_time = NOW(),
        work_hours = TIMESTAMPDIFF(MINUTE, check_in_time, NOW()) / 60,
        extra_hours = GREATEST(0, (TIMESTAMPDIFF(MINUTE, check_in_time, NOW()) / 60) - 9)
    WHERE user_id = p_user_id 
      AND date = v_today 
      AND check_out_time IS NULL;
END //

DELIMITER ;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_attendance_user_month ON attendance(user_id, date);
CREATE INDEX idx_leave_user_status ON leave_requests(user_id, status);
CREATE INDEX idx_salary_user_effective ON salary_structures(user_id, effective_from);
