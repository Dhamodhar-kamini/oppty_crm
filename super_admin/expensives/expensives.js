const BASE_URL = 'https://hiring-api.theoppty.com';
const currentSuperAdminId = localStorage.getItem('adminid'); // From your SuperAdmin login logic

document.addEventListener("DOMContentLoaded", () => {
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => loaderWrapper.classList.add('hidden'), 800);
        }
    });

    if (!currentSuperAdminId) {
        alert("Super Admin not logged in! Redirecting...");
        window.location.href = '../../index.html'; // Redirect to main page
    }
});

// ==========================================
// UTILITIES
// ==========================================

const showToast = (message) => {
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

// Sidebar & Profile Logic
document.getElementById('sidebarToggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.add('active'));
document.getElementById('sidebarClose')?.addEventListener('click', () => document.getElementById('sidebar').classList.remove('active'));

const profileBtn = document.getElementById('profileDropdownBtn');
const profileMenu = document.getElementById('profileDropdown');
if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
    });
    window.addEventListener('click', () => profileMenu.classList.remove('show'));
}

window.logoutSuperAdmin = function() {
    showToast('Logging out Super Admin...');
    localStorage.removeItem('adminid'); 
    setTimeout(() => window.location.href = '../../index.html', 1500);
}

// Image Modal Logic
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
window.openModal = function(src) {
    if (imageModal && modalImg) {
        imageModal.style.display = 'flex';
        modalImg.src = src;
    }
}
document.getElementById('modalClose')?.addEventListener('click', () => imageModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });


// ==========================================
// FETCH & RENDER ALL EXPENSES
// ==========================================

const expensesTableBody = document.getElementById('expensesTableBody');
const expenseMonthFilter = document.getElementById('expenseMonthFilter');

function formatExpenseDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function renderGlobalExpenses() {
    if (!expensesTableBody) return;

    try {
        // Fetch ALL expenses from the new Django API
        const response = await fetch(`${BASE_URL}/api/get-all-expenses/`);
        const result = await response.json();

        if (result.status !== 'success') {
            console.error("Failed to load expenses:", result.message);
            return;
        }

        let expenses = result.data;

        // Determine filter month
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

                const receiptHtml = exp.receipt 
                    ? `<button class="btn btn-secondary btn-sm" onclick="openModal('${BASE_URL}${exp.receipt}')"><i class="fa-solid fa-eye"></i> View</button>` 
                    : `<span style="color:var(--text-muted); font-size:12px;">No Receipt</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatExpenseDate(exp.date)}</td>
                    <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; color: #3b82f6;"><i class="fa-solid fa-user-tie"></i> ${exp.admin_name}</span></td>
                    <td><strong>${exp.category}</strong></td>
                    <td><span style="color: var(--text-muted);">${exp.desc}</span></td>
                    <td><strong style="color: #ef4444;">₹${exp.amount.toLocaleString('en-IN')}</strong></td>
                    <td>${receiptHtml}</td>
                `;
                expensesTableBody.appendChild(tr); 
            }
        });

        if (filteredMonthlyTotal === 0 && expensesTableBody.children.length === 0) {
            expensesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px;">No expenses found for this month.</td></tr>';
        }

        // Update Summary Cards
        document.getElementById('monthlyExpensesTotal').textContent = `₹${filteredMonthlyTotal.toLocaleString('en-IN')}`;
        document.getElementById('allTimeExpensesTotal').textContent = `₹${allTimeTotal.toLocaleString('en-IN')}`;
        
        const monthLabelEl = document.getElementById('monthlyExpensesLabel');
        if (monthLabelEl) {
             const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
             monthLabelEl.textContent = `Total Expenses (${monthNames[filterMonthIndex]} ${filterYear})`;
        }

    } catch (error) {
        console.error("Error fetching global expenses:", error);
    }
}

// Initial setup
if (expensesTableBody) {
    if (expenseMonthFilter && !expenseMonthFilter.value) {
        const today = new Date();
        const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        expenseMonthFilter.value = currentMonthString;
    }
    
    renderGlobalExpenses();
    
    if (expenseMonthFilter) {
        expenseMonthFilter.addEventListener('change', renderGlobalExpenses);
    }
}