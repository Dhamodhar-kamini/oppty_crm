// Replace BASE_URL with your actual Django server URL
const BASE_URL = 'https://hiring-api.theoppty.com'; 
const currentAdminId = localStorage.getItem('adminid');

document.addEventListener("DOMContentLoaded", () => {
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    // Hide loader smoothly once the page is fully loaded
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
            }, 800);
        }
    });

    // Re-trigger loader on internal page navigation
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            if (href && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript')) {
                if (loaderWrapper) {
                    loaderWrapper.classList.remove('hidden');
                }
            }
        });
    });
});

// ==========================================
// REUSABLE UTILITIES & GLOBALS
// ==========================================

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <div>Success</div> <small>${message}</small>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Sidebar Mobile Functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

// Profile Dropdown Logic
const profileBtn = document.getElementById('profileDropdownBtn');
const profileMenu = document.getElementById('profileDropdown');

if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
    });

    window.addEventListener('click', () => {
        if (profileMenu.classList.contains('show')) {
            profileMenu.classList.remove('show');
        }
    });
}

// Global Logout Function
window.logoutAdmin = function() {
    showToast('Logging out... Redirecting to login.', 'success');
    localStorage.removeItem('adminid'); // Clear the session ID
    // Redirect to login page after brief delay
    setTimeout(() => window.location.href = '../heropage/heropage.html', 1500);
}

// Global Image Modal Logic
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const imageModalClose = document.getElementById('modalClose');

window.openModal = function(src) {
    if (imageModal && modalImg) {
        imageModal.style.display = 'flex';
        modalImg.src = src;
    }
}

if (imageModal && imageModalClose) {
    imageModalClose.addEventListener('click', () => imageModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) imageModal.style.display = 'none';
    });
}


// ==========================================
// EXPENSES PAGE LOGIC (TIED TO ADMIN ID & DATABASE)
// ==========================================

const addExpenseModal = document.getElementById('addExpenseModal');
const openExpenseModalBtn = document.getElementById('openExpenseModalBtn');
const closeExpenseModalBtn = document.getElementById('closeExpenseModalBtn');
const saveExpenseBtn = document.getElementById('saveExpenseBtn');
const expenseReceiptFile = document.getElementById('expenseReceiptFile');
const expensesTableBody = document.getElementById('expensesTableBody');
const expenseMonthFilter = document.getElementById('expenseMonthFilter');

// Helper: Format Date from YYYY-MM-DD to Oct 28, 2023
function formatExpenseDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Render Expenses Table by Fetching from Database
async function renderExpenses() {
    if (!expensesTableBody || !currentAdminId) return;

    try {
        // Fetch expenses from Django Database
        const response = await fetch(`${BASE_URL}/api/get-expenses/${currentAdminId}/`);
        const result = await response.json();

        if (result.status !== 'success') {
            console.error("Failed to load expenses:", result.message);
            return;
        }

        let expenses = result.data;

        // Determine the month and year to filter by
        let filterYear, filterMonthIndex;
        if (expenseMonthFilter && expenseMonthFilter.value) {
            const parts = expenseMonthFilter.value.split('-');
            filterYear = parseInt(parts[0]);
            filterMonthIndex = parseInt(parts[1]) - 1; 
        } else {
            const d = new Date();
            filterYear = d.getFullYear();
            filterMonthIndex = d.getMonth();
        }

        expensesTableBody.innerHTML = '';
        let allTimeTotal = 0;
        let filteredMonthlyTotal = 0;

        expenses.forEach(exp => {
            allTimeTotal += exp.amount; 
            
            const expDate = new Date(exp.date);
            const isMatch = (expDate.getMonth() === filterMonthIndex && expDate.getFullYear() === filterYear);
            
            if (isMatch) {
                filteredMonthlyTotal += exp.amount;

                // Handle missing receipts gracefully
                const receiptHtml = exp.receipt 
                    ? `<button class="btn btn-secondary btn-sm" onclick="openModal('${BASE_URL}${exp.receipt}')"><i class="fa-solid fa-eye"></i> View</button>` 
                    : `<span style="color:var(--text-muted); font-size:12px;">No Receipt</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatExpenseDate(exp.date)}</td>
                    <td><strong>${exp.category}</strong></td>
                    <td><span style="color: var(--text-muted);">${exp.desc}</span></td>
                    <td>₹${exp.amount.toLocaleString('en-IN')}</td>
                    <td>${receiptHtml}</td>
                `;
                expensesTableBody.appendChild(tr); 
            }
        });

        if (filteredMonthlyTotal === 0 && expensesTableBody.children.length === 0) {
            expensesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px;">No expenses found for this month.</td></tr>';
        }

        // Update Summary Cards dynamically
        const monthEl = document.getElementById('monthlyExpensesTotal');
        const allTimeEl = document.getElementById('allTimeExpensesTotal');
        const monthLabelEl = document.getElementById('monthlyExpensesLabel');
        
        if (monthEl) monthEl.textContent = `₹${filteredMonthlyTotal.toLocaleString('en-IN')}`;
        if (allTimeEl) allTimeEl.textContent = `₹${allTimeTotal.toLocaleString('en-IN')}`;
        
        if (monthLabelEl) {
             const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
             monthLabelEl.textContent = `Total Expenses (${monthNames[filterMonthIndex]} ${filterYear})`;
        }

    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

// Initial setup
if (expensesTableBody) {
    if (expenseMonthFilter && !expenseMonthFilter.value) {
        const today = new Date();
        const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        expenseMonthFilter.value = currentMonthString;
    }
    
    renderExpenses();
    
    if (expenseMonthFilter) {
        expenseMonthFilter.addEventListener('change', renderExpenses);
    }
}

// Modal Toggles
if (addExpenseModal && openExpenseModalBtn && closeExpenseModalBtn) {
    openExpenseModalBtn.addEventListener('click', () => addExpenseModal.style.display = 'flex');
    closeExpenseModalBtn.addEventListener('click', () => addExpenseModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === addExpenseModal) addExpenseModal.style.display = 'none';
    });
}

// File Upload Name Display
if (expenseReceiptFile) {
    expenseReceiptFile.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Select Image/PDF";
        const label = this.previousElementSibling;
        if (label) label.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> ${fileName}`;
    });
}

// --- SUBMIT NEW EXPENSE DIRECTLY TO DATABASE ---
if (saveExpenseBtn) {
    saveExpenseBtn.addEventListener('click', async () => {
        const amount = document.getElementById('expenseAmount').value;
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value.trim();
        const desc = document.getElementById('expenseDescription').value.trim();

        if (!currentAdminId) {
            alert('Error: Admin not logged in. Please log in again.');
            return;
        }

        if (!amount || !category || !date) {
            alert('Please fill out the Amount, Date, and Category.');
            return;
        }

        // Use FormData to send file & text together
        const formData = new FormData();
        formData.append('admin_id', currentAdminId);
        formData.append('amount', amount);
        formData.append('date', date);
        formData.append('category', category);
        formData.append('description', desc);

        if (expenseReceiptFile && expenseReceiptFile.files[0]) {
            formData.append('photo', expenseReceiptFile.files[0]);
        }

        // Show loading state on button
        const originalBtnText = saveExpenseBtn.innerHTML;
        saveExpenseBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        saveExpenseBtn.disabled = true;

        try {
            // Send to Django backend
            const response = await fetch(`${BASE_URL}/api/add-expense/`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                showToast('Expense saved to database successfully!', 'success');

                // Adjust calendar UI to the newly added month
                const newExpDate = new Date(date);
                if (expenseMonthFilter) {
                    expenseMonthFilter.value = `${newExpDate.getFullYear()}-${String(newExpDate.getMonth() + 1).padStart(2, '0')}`;
                }

                // Close Modal & Clear Inputs
                addExpenseModal.style.display = 'none';
                document.getElementById('expenseAmount').value = '';
                document.getElementById('expenseCategory').value = '';
                document.getElementById('expenseDate').value = '';
                document.getElementById('expenseDescription').value = '';
                if (expenseReceiptFile) {
                    expenseReceiptFile.value = '';
                    expenseReceiptFile.previousElementSibling.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Select Image/PDF`;
                }

                // Re-fetch from database to update UI
                renderExpenses();

            } else {
                alert("Database Error: " + result.message);
            }

        } catch (error) {
            console.error("Network error:", error);
            alert("Error connecting to the server.");
        } finally {
            // Restore button state
            saveExpenseBtn.innerHTML = originalBtnText;
            saveExpenseBtn.disabled = false;
        }
    });
}