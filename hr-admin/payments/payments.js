// ==========================================
// HR CRM Admin - Payments Ledger Logic
// ==========================================

const BASE_URL = 'http://127.0.0.1:8000'; // Ensure this points to your Django server

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Page Loader Logic ---
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => loaderWrapper.classList.add('hidden'), 800); 
        }
    });

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            if (href && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript')) {
                if (loaderWrapper) loaderWrapper.classList.remove('hidden');
            }
        });
    });
});

// --- 2. Reusable Utilities ---
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

// --- 3. Sidebar & Profile Dropdown ---
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

const profileBtn = document.getElementById('profileDropdownBtn');
const profileMenu = document.getElementById('profileDropdown');

if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        profileMenu.classList.toggle('show');
    });
    window.addEventListener('click', () => {
        if (profileMenu.classList.contains('show')) profileMenu.classList.remove('show');
    });
}

// --- 4. Global Image Preview Modal ---
window.openModal = function(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = src;
    }
}

const closeModal = document.getElementById('modalClose');
const imageModal = document.getElementById('imageModal');
if(closeModal && imageModal) {
    closeModal.addEventListener('click', () => imageModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if(e.target == imageModal) imageModal.style.display = 'none';
    });
}


// ==========================================
// 5. PAYMENTS API & FULL DATE FILTERING LOGIC
// ==========================================

const paymentsTableBody = document.getElementById('paymentsTableBody');
const paymentDateFilter = document.getElementById('paymentMonthFilter'); // ID remains the same for compatibility

if (paymentsTableBody) {
    let allPaymentsData = []; 

    /**
     * Fetches payments for a SPECIFIC DATE from the backend. 
     * @param {string} selectedDate - The YYYY-MM-DD string.
     */
    const fetchPaymentsByDate = async (selectedDate = '') => {
        try {
            paymentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching records...</td></tr>';

            // Construct URL with query parameters
            let url = `${BASE_URL}/api/all_payments/`;
            if (selectedDate) {
                url += `?date=${selectedDate}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch payments");
            
            allPaymentsData = await response.json();
            renderPaymentsTable();
        } catch (error) {
            console.error("Fetch Error:", error);
            paymentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--danger);">Error loading payments from server.</td></tr>';
        }
    };

    /**
     * Renders the data received from the API into the table.
     */
    const renderPaymentsTable = () => {
        paymentsTableBody.innerHTML = '';
        
        if (allPaymentsData.length === 0) {
            paymentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">No payments found for this specific date.</td></tr>`;
            return;
        }

        allPaymentsData.forEach(p => {
            const dateObj = new Date(p.payment_date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#TRX-${p.id.toString().padStart(4, '0')}</td>
                <td><strong>${p.candidate_name || 'N/A'}</strong></td>
                <td>${formattedDate}</td>
                <td>${p.bank_name || 'N/A'}</td>
                <td>₹${parseFloat(p.amount).toLocaleString('en-IN')}</td>
                <td><span class="badge paid">Paid</span></td>
                <td>
                    ${p.screenshot 
                        ? `<button class="btn btn-secondary btn-sm" onclick="openModal('${BASE_URL}${p.screenshot}')"><i class="fa-solid fa-eye"></i> Receipt</button>` 
                        : '<span style="color:var(--text-muted); font-size:0.85rem;">No Receipt</span>'
                    }
                </td>
            `;
            paymentsTableBody.appendChild(tr);
        });
    };

    // Listen for changes on the Date Filter
    if (paymentDateFilter) {
        paymentDateFilter.addEventListener('change', (e) => {
            const selectedDate = e.target.value; // Returns "YYYY-MM-DD"
            fetchPaymentsByDate(selectedDate);
        });

        // --- SET DEFAULT TO TODAY (YYYY-MM-DD) ---
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${yyyy}-${mm}-${dd}`;
        
        paymentDateFilter.value = formattedToday;
        
        // Initial fetch for today's records
        fetchPaymentsByDate(formattedToday);
    }
}

window.logoutAdmin = () => showToast('Logging out...');