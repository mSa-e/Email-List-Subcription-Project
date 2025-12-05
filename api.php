<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = 'localhost';
$dbname = 'email list subcription';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getDashboardStats':
        getDashboardStats($pdo);
        break;
    case 'getEmails':
        getEmails($pdo);
        break;
    case 'getEmail':
        getEmail($pdo);
        break;
    case 'addEmail':
        addEmail($pdo);
        break;
    case 'updateEmail':
        updateEmail($pdo);
        break;
    case 'deleteEmail':
        deleteEmail($pdo);
        break;
    case 'getEmployees':
        getEmployees($pdo);
        break;
    case 'getEmployee':
        getEmployee($pdo);
        break;
    case 'addEmployee':
        addEmployee($pdo);
        break;
    case 'updateEmployee':
        updateEmployee($pdo);
        break;
    case 'deleteEmployee':
        deleteEmployee($pdo);
        break;
    case 'getDepartments':
        getDepartments($pdo);
        break;
    case 'getDepartment':
        getDepartment($pdo);
        break;
    case 'addDepartment':
        addDepartment($pdo);
        break;
    case 'updateDepartment':
        updateDepartment($pdo);
        break;
    case 'deleteDepartment':
        deleteDepartment($pdo);
        break;
    case 'exportCSV':
        exportCSV($pdo);
        break;
    case 'importCSV':
        importCSV($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getDashboardStats($pdo)
{
    try {
        // Total subscribers
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM email_lists");
        $stmt->execute();
        $totalSubscribers = $stmt->fetchColumn();

        // Active subscribers
        $stmt = $pdo->prepare("SELECT COUNT(*) as active FROM email_lists WHERE is_active = 1");
        $stmt->execute();
        $activeSubscribers = $stmt->fetchColumn();

        // Total employees
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM employees");
        $stmt->execute();
        $totalEmployees = $stmt->fetchColumn();

        // Total departments
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM departments");
        $stmt->execute();
        $totalDepartments = $stmt->fetchColumn();

        // Subscriptions by source
        $stmt = $pdo->prepare("
            SELECT source_page, COUNT(*) as count 
            FROM email_lists 
            WHERE source_page IS NOT NULL AND source_page != ''
            GROUP BY source_page
        ");
        $stmt->execute();
        $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $subscriptionsBySource = [
            'labels' => array_column($sources, 'source_page'),
            'data' => array_column($sources, 'count')
        ];

        // Employees by department
        $stmt = $pdo->prepare("
            SELECT d.department_name, COUNT(e.employee_id) as count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.department_name
        ");
        $stmt->execute();
        $deptEmployees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $employeesByDepartment = [
            'labels' => array_column($deptEmployees, 'department_name'),
            'data' => array_column($deptEmployees, 'count')
        ];

        echo json_encode([
            'success' => true,
            'data' => [
                'totalSubscribers' => $totalSubscribers,
                'activeSubscribers' => $activeSubscribers,
                'totalEmployees' => $totalEmployees,
                'totalDepartments' => $totalDepartments,
                'subscriptionsBySource' => $subscriptionsBySource,
                'employeesByDepartment' => $employeesByDepartment
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getEmails($pdo)
{
    try {
        $stmt = $pdo->prepare("SELECT * FROM email_lists ORDER BY subscription_date DESC");
        $stmt->execute();
        $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $emails]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getEmail($pdo)
{
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("SELECT * FROM email_lists WHERE email_id = ?");
        $stmt->execute([$id]);
        $email = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($email) {
            echo json_encode(['success' => true, 'data' => $email]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addEmail($pdo)
{
    try {
        $email_address = $_POST['email_address'];
        $first_name = $_POST['first_name'] ?? null;
        $last_name = $_POST['last_name'] ?? null;
        $source_page = $_POST['source_page'] ?? null;
        $is_active = $_POST['is_active'] ?? 1;
        $ip_address = $_SERVER['REMOTE_ADDR'];

        $stmt = $pdo->prepare("
            INSERT INTO email_lists (email_address, first_name, last_name, source_page, is_active, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email_address, $first_name, $last_name, $source_page, $is_active, $ip_address]);

        echo json_encode(['success' => true, 'message' => 'Email added successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function updateEmail($pdo)
{
    try {
        $email_id = $_POST['email_id'];
        $email_address = $_POST['email_address'];
        $first_name = $_POST['first_name'] ?? null;
        $last_name = $_POST['last_name'] ?? null;
        $source_page = $_POST['source_page'] ?? null;
        $is_active = $_POST['is_active'] ?? 1;

        $stmt = $pdo->prepare("
            UPDATE email_lists 
            SET email_address = ?, first_name = ?, last_name = ?, source_page = ?, is_active = ?
            WHERE email_id = ?
        ");
        $stmt->execute([$email_address, $first_name, $last_name, $source_page, $is_active, $email_id]);

        echo json_encode(['success' => true, 'message' => 'Email updated successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function deleteEmail($pdo)
{
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM email_lists WHERE email_id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Email deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getEmployees($pdo)
{
    try {
        $stmt = $pdo->prepare("
            SELECT e.*, d.department_name 
            FROM employees e 
            JOIN departments d ON e.department_id = d.department_id 
            ORDER BY e.first_name, e.last_name
        ");
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $employees]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getEmployee($pdo)
{
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("
            SELECT * FROM employees WHERE employee_id = ?
        ");
        $stmt->execute([$id]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($employee) {
            echo json_encode(['success' => true, 'data' => $employee]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addEmployee($pdo)
{
    try {
        $first_name = $_POST['first_name'];
        $last_name = $_POST['last_name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'] ?? null;
        $department_id = $_POST['department_id'];
        $position = $_POST['position'];
        $is_supervisor = $_POST['is_supervisor'] ?? 0;
        $is_head = $_POST['is_head'] ?? 0;
        $hire_date = $_POST['hire_date'] ?? null;

        // Check if department already has a head
        if ($is_head) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE department_id = ? AND is_head = 1");
            $stmt->execute([$department_id]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'This department already has a head']);
                return;
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO employees (first_name, last_name, email, phone, department_id, position, is_supervisor, is_head, hire_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$first_name, $last_name, $email, $phone, $department_id, $position, $is_supervisor, $is_head, $hire_date]);

        echo json_encode(['success' => true, 'message' => 'Employee added successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function updateEmployee($pdo)
{
    try {
        $employee_id = $_POST['employee_id'];
        $first_name = $_POST['first_name'];
        $last_name = $_POST['last_name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'] ?? null;
        $department_id = $_POST['department_id'];
        $position = $_POST['position'];
        $is_supervisor = $_POST['is_supervisor'] ?? 0;
        $is_head = $_POST['is_head'] ?? 0;
        $hire_date = $_POST['hire_date'] ?? null;

        // Check if department already has a head (excluding current employee)
        if ($is_head) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE department_id = ? AND is_head = 1 AND employee_id != ?");
            $stmt->execute([$department_id, $employee_id]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'This department already has a head']);
                return;
            }
        }

        $stmt = $pdo->prepare("
            UPDATE employees 
            SET first_name = ?, last_name = ?, email = ?, phone = ?, department_id = ?, position = ?, 
                is_supervisor = ?, is_head = ?, hire_date = ?
            WHERE employee_id = ?
        ");
        $stmt->execute([$first_name, $last_name, $email, $phone, $department_id, $position, $is_supervisor, $is_head, $hire_date, $employee_id]);

        echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Email address already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function deleteEmployee($pdo)
{
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM employees WHERE employee_id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getDepartments($pdo)
{
    try {
        $stmt = $pdo->prepare("
            SELECT d.*, 
                   COUNT(e.employee_id) as employee_count,
                   SUM(e.is_supervisor) as supervisor_count,
                   SUM(e.is_head) as head_count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id
            ORDER BY d.department_name
        ");
        $stmt->execute();
        $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $departments]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getDepartment($pdo)
{
    try {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("SELECT * FROM departments WHERE department_id = ?");
        $stmt->execute([$id]);
        $department = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($department) {
            echo json_encode(['success' => true, 'data' => $department]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Department not found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addDepartment($pdo)
{
    try {
        $department_name = $_POST['department_name'];
        $description = $_POST['description'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO departments (department_name, description) VALUES (?, ?)");
        $stmt->execute([$department_name, $description]);

        echo json_encode(['success' => true, 'message' => 'Department added successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function updateDepartment($pdo)
{
    try {
        $department_id = $_POST['department_id'];
        $department_name = $_POST['department_name'];
        $description = $_POST['description'] ?? null;

        $stmt = $pdo->prepare("
            UPDATE departments 
            SET department_name = ?, description = ?
            WHERE department_id = ?
        ");
        $stmt->execute([$department_name, $description, $department_id]);

        echo json_encode(['success' => true, 'message' => 'Department updated successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

function deleteDepartment($pdo)
{
    try {
        $id = $_GET['id'];

        // Check if department has employees
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE department_id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'Cannot delete department with employees. Please reassign or delete employees first.']);
            return;
        }

        $stmt = $pdo->prepare("DELETE FROM departments WHERE department_id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Department deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function exportCSV($pdo)
{
    try {
        $stmt = $pdo->prepare("SELECT * FROM email_lists WHERE is_active = 1");
        $stmt->execute();
        $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="email_subscribers_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        fputcsv($output, ['Email', 'First Name', 'Last Name', 'Subscription Date', 'Source Page']);

        foreach ($emails as $email) {
            fputcsv($output, [
                $email['email_address'],
                $email['first_name'],
                $email['last_name'],
                $email['subscription_date'],
                $email['source_page']
            ]);
        }

        fclose($output);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function importCSV($pdo)
{
    try {
        if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] != UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'File upload failed']);
            return;
        }

        $file = $_FILES['csv_file']['tmp_name'];
        $handle = fopen($file, 'r');

        if ($handle === FALSE) {
            echo json_encode(['success' => false, 'message' => 'Cannot open uploaded file']);
            return;
        }

        // Skip header row
        fgetcsv($handle);

        $imported = 0;
        $skipped = 0;

        $stmt = $pdo->prepare("
            INSERT IGNORE INTO email_lists (email_address, first_name, last_name, source_page, ip_address)
            VALUES (?, ?, ?, ?, ?)
        ");

        while (($data = fgetcsv($handle)) !== FALSE) {
            if (count($data) >= 1) {
                $email = $data[0];
                $first_name = $data[1] ?? null;
                $last_name = $data[2] ?? null;
                $source_page = $data[3] ?? 'CSV Import';
                $ip_address = $_SERVER['REMOTE_ADDR'];

                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $stmt->execute([$email, $first_name, $last_name, $source_page, $ip_address]);
                    if ($stmt->rowCount() > 0) {
                        $imported++;
                    } else {
                        $skipped++;
                    }
                } else {
                    $skipped++;
                }
            }
        }

        fclose($handle);

        echo json_encode([
            'success' => true,
            'message' => "Imported $imported emails, skipped $skipped duplicates/invalid entries"
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
