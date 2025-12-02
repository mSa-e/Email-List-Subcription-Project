-- -- Departments Table
-- CREATE TABLE departments (
--     department_id INT PRIMARY KEY AUTO_INCREMENT,
--     department_name VARCHAR(100) NOT NULL UNIQUE,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- -- Employees Table
-- CREATE TABLE employees (
--     employee_id INT PRIMARY KEY AUTO_INCREMENT,
--     first_name VARCHAR(50) NOT NULL,
--     last_name VARCHAR(50) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     phone VARCHAR(20),
--     department_id INT NOT NULL,
--     position VARCHAR(50) NOT NULL,
--     is_supervisor BOOLEAN DEFAULT FALSE,
--     is_head BOOLEAN DEFAULT FALSE,
--     hire_date DATE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (department_id) REFERENCES departments(department_id)
-- );


-- -- Email Lists Table
-- CREATE TABLE email_lists (
--     email_id INT PRIMARY KEY AUTO_INCREMENT,
--     email_address VARCHAR(100) NOT NULL UNIQUE,
--     first_name VARCHAR(50),
--     last_name VARCHAR(50),
--     subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     is_active BOOLEAN DEFAULT TRUE,
--     source_page VARCHAR(255),
--     ip_address VARCHAR(45)
-- );


-- -- Subscription Preferences Table
-- CREATE TABLE subscription_preferences (
--     preference_id INT PRIMARY KEY AUTO_INCREMENT,
--     email_id INT NOT NULL,
--     category VARCHAR(50),
--     is_subscribed BOOLEAN DEFAULT TRUE,
--     FOREIGN KEY (email_id) REFERENCES email_lists(email_id) ON DELETE CASCADE
-- );


        -- INSERT IGNORE INTO employees (first_name, last_name, email, department_id, position, is_supervisor, is_head) VALUES
        -- ('John', 'Smith', 'john.smith@company.com', 1, 'Head of Marketing', FALSE, TRUE),
        -- ('Sarah', 'Johnson', 'sarah.johnson@company.com', 1, 'Marketing Supervisor', TRUE, FALSE),
        -- ('Mike', 'Brown', 'mike.brown@company.com', 1, 'Marketing Specialist', FALSE, FALSE),
        -- ('Emily', 'Davis', 'emily.davis@company.com', 2, 'Head of Sales', FALSE, TRUE),
        -- ('David', 'Wilson', 'david.wilson@company.com', 2, 'Sales Supervisor', TRUE, FALSE),
        -- ('Lisa', 'Miller', 'lisa.miller@company.com', 2, 'Sales Representative', FALSE, FALSE),
        -- ('Robert', 'Taylor', 'robert.taylor@company.com', 3, 'Head of IT', FALSE, TRUE),
        -- ('Jennifer', 'Anderson', 'jennifer.anderson@company.com', 3, 'IT Supervisor', TRUE, FALSE),
        -- ('Kevin', 'Clark', 'kevin.clark@company.com', 3, 'Developer', FALSE, FALSE)


        
        -- INSERT INTO email_lists (email_address, first_name, last_name, source_page) VALUES
        -- ('user1@gmail.com', 'Alice', 'Johnson', 'homepage'),
        -- ('user2@yahoo.com', 'Bob', 'Smith', 'blog'),
        -- ('user3@outlook.com', 'Carol', 'Williams', 'product_page'),
        -- ('user4@gmail.com', 'David', 'Brown', 'homepage'),
        -- ('user5@company.com', 'Eva', 'Davis', 'newsletter')

