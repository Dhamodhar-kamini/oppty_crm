document.addEventListener("DOMContentLoaded", () => {
    const loaderWrapper = document.getElementById('oppty-page-loader');
    
    // Hide loader smoothly once the page is fully loaded
    window.addEventListener('load', () => {
        if (loaderWrapper) {
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
            }, 800); // Slight delay to ensure the bounce animation cycles elegantly
        }
    });

    // Re-trigger loader on internal page navigation
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // Check if it's a valid internal link (not a # anchor or new tab)
            if (href && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript')) {
                if (loaderWrapper) {
                    loaderWrapper.classList.remove('hidden');
                }
            }
        });
    });
});



document.addEventListener('DOMContentLoaded', () => {

    // 1. SKELETON LOADER SIMULATION
    // Remove the 'loading' class after 1.5 seconds to reveal content
    const dashboard = document.querySelector('.skeleton-container');
    dashboard.classList.add('loading');
    setTimeout(() => {
        dashboard.classList.remove('loading');
        animateCounters(); // Start counters only after loading completes
    }, 1500);

    // 2. NUMBER COUNTER ANIMATION
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200; // The lower the slower

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace(/,/g, ''); // Remove commas for calculation
                const inc = target / speed;

                if (count < target) {
                    const newValue = Math.ceil(count + inc);
                    counter.innerText = newValue.toLocaleString('en-US'); // Add commas back
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target.toLocaleString('en-US');
                }
            };
            updateCount();
        });
    }

    // 3. CHART.JS INITIALIZATION
    // Global Chart Configuration for theming
    Chart.defaults.color = '#a3bed1';
    Chart.defaults.font.family = "'Poppins', sans-serif";

    // A. Hiring Funnel (Bar Chart)
    const ctxFunnel = document.getElementById('hiringFunnelChart').getContext('2d');
    new Chart(ctxFunnel, {
        type: 'bar',
        data: {
            labels: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Hired'],
            datasets: [{
                label: 'Candidates',
                data: [350, 150, 80, 35, 28],
                backgroundColor: 'rgba(255, 107, 0, 0.8)',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(163, 190, 209, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // B. Cash Flow (Line Chart)
    const ctxCash = document.getElementById('cashFlowChart').getContext('2d');
    
    // Create gradient for Revenue line
    const gradientRev = ctxCash.createLinearGradient(0, 0, 0, 300);
    gradientRev.addColorStop(0, 'rgba(5, 205, 153, 0.4)');
    gradientRev.addColorStop(1, 'rgba(5, 205, 153, 0.0)');

    // Create gradient for Expense line
    const gradientExp = ctxCash.createLinearGradient(0, 0, 0, 300);
    gradientExp.addColorStop(0, 'rgba(238, 93, 80, 0.4)');
    gradientExp.addColorStop(1, 'rgba(238, 93, 80, 0.0)');

    new Chart(ctxCash, {
        type: 'line',
        data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [320000, 340000, 310000, 380000, 410000, 450000],
                    borderColor: '#05cd99',
                    backgroundColor: gradientRev,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: [100000, 105000, 110000, 95000, 115000, 125000],
                    borderColor: '#ee5d50',
                    backgroundColor: gradientExp,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', align: 'end' }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(163, 190, 209, 0.1)' },
                    ticks: { callback: function(value) { return '₹' + value / 1000 + 'k'; } }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. ROLE-BASED UI SIMULATION
    const roleSwitch = document.getElementById('roleSwitch');
    const financeElements = document.querySelectorAll('.finance-item');

    // Toggle Role Function
    roleSwitch.addEventListener('change', (e) => {
        const isRecruiter = e.target.checked;
        
        financeElements.forEach(el => {
            // Apply fade animation
            el.style.transition = 'opacity 0.3s ease';
            if (isRecruiter) {
                el.style.opacity = '0';
                setTimeout(() => el.style.display = 'none', 300);
            } else {
                el.style.display = ''; // Reset to default (flex/block based on CSS)
                setTimeout(() => el.style.opacity = '1', 10);
            }
        });

        // Optional: Show a toast/alert
        console.log(`Role switched to: ${isRecruiter ? 'Recruiter' : 'Admin'}`);
    });

    // 5. GLOBAL SEARCH (Mock Filtering)
    const searchInput = document.getElementById('globalSearch');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        // In a real app, this would filter a table or make an API call.
        // Here, we just log to show it's hooked up.
        console.log(`Searching for: ${term}`);
    });

    // 6. QUICK ACTIONS & EXPORTS (Mock functionality)
    window.triggerAction = function(actionName) {
        alert(`Opening modal for: ${actionName}`);
    };

    document.getElementById('exportPdf').addEventListener('click', () => {
        alert('Generating PDF Dashboard Report...');
    });

    document.getElementById('exportCsv').addEventListener('click', () => {
        alert('Exporting Financial & Candidate Data to CSV...');
    });

    // 7. DARK MODE TOGGLE
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Check local storage for theme preference
    if(localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'light') {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        
        // Update Chart colors if needed (requires chart.update())
        // For production, you would update Chart.defaults.color and re-render here.
    });

    // Format currency prefix initially before counter starts
    document.querySelectorAll('.prefix-currency').forEach(el => {
        el.innerText = '₹0';
    });
});