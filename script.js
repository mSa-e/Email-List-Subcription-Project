// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Tab switching
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Update header title
            updateHeaderTitle(tabId);
            
            // Load data for the active tab
            loadTabData(tabId);
        });
    });
    
    // Modal functionality
    setupModals();
    
    // Load initial data
    loadDashboardData();
});

function updateHeaderTitle(tabId) {
    const headerTitle = document.querySelector('.header-left h1');
    const titles = {
        'dashboard': 'Dashboard Overview',
        'emails': 'Email Subscribers Management',
        'employees': 'Employees Management',
        'departments': 'Departments Management',
        'import-export': 'Import/Export Data'
    };
    
    headerTitle.textContent = titles[tabId] || 'Dashboard Overview';
}

function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'emails':
            loadEmailsData();
            break;
        case 'employees':
            loadEmployeesData();
            break;
        case 'departments':
            loadDepartmentsData();
            break;
    }
}

function initApp() {
    // Load initial departments for employee form
    loadDepartmentsForSelect();
}

// Dashboard Functions
function loadDashboardData() {
    fetch('api.php?action=getDashboardStats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateDashboardStats(data.data);
            }
        })
        .catch(error => console.error('Error loading dashboard data:', error));
}

function updateDashboardStats(stats) {
    document.getElementById('total-subscribers').textContent = stats.totalSubscribers || 0;
    document.getElementById('active-subscribers').textContent = stats.activeSubscribers || 0;
    document.getElementById('total-employees').textContent = stats.totalEmployees || 0;
    document.getElementById('total-departments').textContent = stats.totalDepartments || 0;
}

// Email Management Functions
function loadEmailsData() {
    fetch('api.php?action=getEmails')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateEmailsTable(data.data);
            }
        })
        .catch(error => console.error('Error loading emails data:', error));
}

function populateEmailsTable(emails) {
    const tbody = document.getElementById('emails-tbody');
    tbody.innerHTML = '';
    
    emails.forEach(email => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${email.email_id}</td>
            <td>${email.email_address}</td>
            <td>${email.first_name || ''} ${email.last_name || ''}</td>
            <td>${formatDate(email.subscription_date)}</td>
            <td><span class="status-badge ${email.is_active ? 'status-active' : 'status-inactive'}">${email.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>${email.source_page || 'N/A'}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-email" data-id="${email.email_id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-email" data-id="${email.email_id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners for email actions
    document.querySelectorAll('.edit-email').forEach(btn => {
        btn.addEventListener('click', function() {
            const emailId = this.getAttribute('data-id');
            editEmail(emailId);
        });
    });
    
    document.querySelectorAll('.delete-email').forEach(btn => {
        btn.addEventListener('click', function() {
            const emailId = this.getAttribute('data-id');
            deleteEmail(emailId);
        });
    });
}

// Employee Management Functions
function loadEmployeesData() {
    fetch('api.php?action=getEmployees')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateEmployeesTable(data.data);
            }
        })
        .catch(error => console.error('Error loading employees data:', error));
}

function populateEmployeesTable(employees) {
    const tbody = document.getElementById('employees-tbody');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const role = employee.is_head ? 'Head' : (employee.is_supervisor ? 'Supervisor' : 'Regular');
        const roleClass = employee.is_head ? 'role-head' : (employee.is_supervisor ? 'role-supervisor' : 'role-regular');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.employee_id}</td>
            <td>${employee.first_name} ${employee.last_name}</td>
            <td>${employee.email}</td>
            <td>${employee.department_name}</td>
            <td>${employee.position}</td>
            <td><span class="role-badge ${roleClass}">${role}</span></td>
            <td>${employee.hire_date ? formatDate(employee.hire_date) : 'N/A'}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-employee" data-id="${employee.employee_id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-employee" data-id="${employee.employee_id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners for employee actions
    document.querySelectorAll('.edit-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            editEmployee(employeeId);
        });
    });
    
    document.querySelectorAll('.delete-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            deleteEmployee(employeeId);
        });
    });
}

// Department Management Functions
function loadDepartmentsData() {
    fetch('api.php?action=getDepartments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateDepartmentsCards(data.data);
            }
        })
        .catch(error => console.error('Error loading departments data:', error));
}

function populateDepartmentsCards(departments) {
    const container = document.getElementById('department-cards');
    container.innerHTML = '';
    
    departments.forEach(dept => {
        const card = document.createElement('div');
        card.className = 'department-card';
        card.innerHTML = `
            <div class="department-header">
                <div class="department-name">${dept.department_name}</div>
                <div class="department-actions">
                    <button class="btn btn-warning btn-sm edit-department" data-id="${dept.department_id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-department" data-id="${dept.department_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="department-description">${dept.description || 'No description provided.'}</div>
            <div class="department-stats">
                <div class="stat">
                    <div class="stat-value">${dept.employee_count || 0}</div>
                    <div class="stat-label">Employees</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${dept.supervisor_count || 0}</div>
                    <div class="stat-label">Supervisors</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${dept.head_count || 0}</div>
                    <div class="stat-label">Heads</div>
                </div>
            </div>
            <div class="department-meta">
                <small>Created: ${formatDate(dept.created_at)}</small>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Add event listeners for department actions
    document.querySelectorAll('.edit-department').forEach(btn => {
        btn.addEventListener('click', function() {
            const departmentId = this.getAttribute('data-id');
            editDepartment(departmentId);
        });
    });
    
    document.querySelectorAll('.delete-department').forEach(btn => {
        btn.addEventListener('click', function() {
            const departmentId = this.getAttribute('data-id');
            deleteDepartment(departmentId);
        });
    });
}

// Load departments for select dropdown
function loadDepartmentsForSelect() {
    fetch('api.php?action=getDepartments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('employee-department');
                select.innerHTML = '<option value="">Select Department</option>';
                
                data.data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.department_id;
                    option.textContent = dept.department_name;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading departments for select:', error));
}

// Modal Setup
function setupModals() {
    // Email Modal
    const emailModal = document.getElementById('email-modal');
    const addEmailBtn = document.getElementById('add-email-btn');
    const cancelEmailBtn = document.getElementById('cancel-email');
    const emailForm = document.getElementById('email-form');
    
    addEmailBtn.addEventListener('click', () => openEmailModal());
    cancelEmailBtn.addEventListener('click', () => closeModal(emailModal));
    emailForm.addEventListener('submit', handleEmailSubmit);
    
    // Employee Modal
    const employeeModal = document.getElementById('employee-modal');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const cancelEmployeeBtn = document.getElementById('cancel-employee');
    const employeeForm = document.getElementById('employee-form');
    
    addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    cancelEmployeeBtn.addEventListener('click', () => closeModal(employeeModal));
    employeeForm.addEventListener('submit', handleEmployeeSubmit);
    
    // Department Modal
    const departmentModal = document.getElementById('department-modal');
    const addDepartmentBtn = document.getElementById('add-department-btn');
    const cancelDepartmentBtn = document.getElementById('cancel-department');
    const departmentForm = document.getElementById('department-form');
    
    addDepartmentBtn.addEventListener('click', () => openDepartmentModal());
    cancelDepartmentBtn.addEventListener('click', () => closeModal(departmentModal));
    departmentForm.addEventListener('submit', handleDepartmentSubmit);
    
    // Close modals when clicking outside or on close button
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Import/Export functionality
    document.getElementById('export-btn').addEventListener('click', exportToCSV);
    document.getElementById('import-form').addEventListener('submit', handleImport);
}

function openEmailModal(emailId = null) {
    const modal = document.getElementById('email-modal');
    const title = document.getElementById('email-modal-title');
    const form = document.getElementById('email-form');
    
    if (emailId) {
        title.textContent = 'Edit Subscriber';
        // Load email data
        fetch(`api.php?action=getEmail&id=${emailId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('email-id').value = data.data.email_id;
                    document.getElementById('email-address').value = data.data.email_address;
                    document.getElementById('first-name').value = data.data.first_name || '';
                    document.getElementById('last-name').value = data.data.last_name || '';
                    document.getElementById('source-page').value = data.data.source_page || '';
                    document.getElementById('is-active').value = data.data.is_active ? '1' : '0';
                }
            });
    } else {
        title.textContent = 'Add New Subscriber';
        form.reset();
        document.getElementById('email-id').value = '';
    }
    
    modal.classList.add('active');
}

function openEmployeeModal(employeeId = null) {
    const modal = document.getElementById('employee-modal');
    const title = document.getElementById('employee-modal-title');
    const form = document.getElementById('employee-form');
    
    if (employeeId) {
        title.textContent = 'Edit Employee';
        // Load employee data
        fetch(`api.php?action=getEmployee&id=${employeeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const employee = data.data;
                    document.getElementById('employee-id').value = employee.employee_id;
                    document.getElementById('employee-first-name').value = employee.first_name;
                    document.getElementById('employee-last-name').value = employee.last_name;
                    document.getElementById('employee-email').value = employee.email;
                    document.getElementById('employee-phone').value = employee.phone || '';
                    document.getElementById('employee-department').value = employee.department_id;
                    document.getElementById('employee-position').value = employee.position;
                    document.getElementById('employee-hire-date').value = employee.hire_date || '';
                    
                    let roleValue = '0';
                    if (employee.is_head) roleValue = '2';
                    else if (employee.is_supervisor) roleValue = '1';
                    document.getElementById('employee-role').value = roleValue;
                }
            });
    } else {
        title.textContent = 'Add New Employee';
        form.reset();
        document.getElementById('employee-id').value = '';
        document.getElementById('employee-hire-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
}

function openDepartmentModal(departmentId = null) {
    const modal = document.getElementById('department-modal');
    const title = document.getElementById('department-modal-title');
    const form = document.getElementById('department-form');
    
    if (departmentId) {
        title.textContent = 'Edit Department';
        // Load department data
        fetch(`api.php?action=getDepartment&id=${departmentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('department-id').value = data.data.department_id;
                    document.getElementById('department-name').value = data.data.department_name;
                    document.getElementById('department-description').value = data.data.description || '';
                }
            });
    } else {
        title.textContent = 'Add New Department';
        form.reset();
        document.getElementById('department-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// Form Handlers
function handleEmailSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('email_id', document.getElementById('email-id').value);
    formData.append('email_address', document.getElementById('email-address').value);
    formData.append('first_name', document.getElementById('first-name').value);
    formData.append('last_name', document.getElementById('last-name').value);
    formData.append('source_page', document.getElementById('source-page').value);
    formData.append('is_active', document.getElementById('is-active').value);
    
    const action = document.getElementById('email-id').value ? 'updateEmail' : 'addEmail';
    
    fetch('api.php?action=' + action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal(document.getElementById('email-modal'));
            loadEmailsData();
            showNotification('Subscriber saved successfully!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while saving the subscriber.', 'error');
    });
}

function handleEmployeeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('employee_id', document.getElementById('employee-id').value);
    formData.append('first_name', document.getElementById('employee-first-name').value);
    formData.append('last_name', document.getElementById('employee-last-name').value);
    formData.append('email', document.getElementById('employee-email').value);
    formData.append('phone', document.getElementById('employee-phone').value);
    formData.append('department_id', document.getElementById('employee-department').value);
    formData.append('position', document.getElementById('employee-position').value);
    formData.append('hire_date', document.getElementById('employee-hire-date').value);
    
    const roleValue = document.getElementById('employee-role').value;
    formData.append('is_supervisor', roleValue === '1' ? '1' : '0');
    formData.append('is_head', roleValue === '2' ? '1' : '0');
    
    const action = document.getElementById('employee-id').value ? 'updateEmployee' : 'addEmployee';
    
    fetch('api.php?action=' + action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal(document.getElementById('employee-modal'));
            loadEmployeesData();
            showNotification('Employee saved successfully!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while saving the employee.', 'error');
    });
}

function handleDepartmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('department_id', document.getElementById('department-id').value);
    formData.append('department_name', document.getElementById('department-name').value);
    formData.append('description', document.getElementById('department-description').value);
    
    const action = document.getElementById('department-id').value ? 'updateDepartment' : 'addDepartment';
    
    fetch('api.php?action=' + action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal(document.getElementById('department-modal'));
            loadDepartmentsData();
            loadDepartmentsForSelect();
            showNotification('Department saved successfully!', 'success');
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while saving the department.', 'error');
    });
}

// Edit functions
function editEmail(emailId) {
    openEmailModal(emailId);
}

function editEmployee(employeeId) {
    openEmployeeModal(employeeId);
}

function editDepartment(departmentId) {
    openDepartmentModal(departmentId);
}

// Delete functions
function deleteEmail(emailId) {
    if (confirm('Are you sure you want to delete this subscriber?')) {
        fetch('api.php?action=deleteEmail&id=' + emailId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadEmailsData();
                    showNotification('Subscriber deleted successfully!', 'success');
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while deleting the subscriber.', 'error');
            });
    }
}

function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch('api.php?action=deleteEmployee&id=' + employeeId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadEmployeesData();
                    showNotification('Employee deleted successfully!', 'success');
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while deleting the employee.', 'error');
            });
    }
}

function deleteDepartment(departmentId) {
    if (confirm('Are you sure you want to delete this department? This will also remove all employees in this department.')) {
        fetch('api.php?action=deleteDepartment&id=' + departmentId)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadDepartmentsData();
                    loadDepartmentsForSelect();
                    showNotification('Department deleted successfully!', 'success');
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while deleting the department.', 'error');
            });
    }
}

// Import/Export functions
function exportToCSV() {
    window.location.href = 'api.php?action=exportCSV';
}

function handleImport(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('csv-file');
    if (!fileInput.files.length) {
        showNotification('Please select a CSV file to import.', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('csv_file', fileInput.files[0]);
    
    fetch('api.php?action=importCSV', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fileInput.value = '';
            showNotification('CSV imported successfully! ' + data.message, 'success');
            loadEmailsData();
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while importing the CSV.', 'error');
    });
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for notification
    if (!document.querySelector('.notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                z-index: 3000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            .notification-success { background-color: #28a745; }
            .notification-error { background-color: #dc3545; }
            .notification-info { background-color: #17a2b8; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add slideOut animation
if (!document.querySelector('.notification-animations')) {
    const animations = document.createElement('style');
    animations.className = 'notification-animations';
    animations.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(animations);
}