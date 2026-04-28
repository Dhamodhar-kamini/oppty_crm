// ====== MODAL LOGIC ======
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => {
        openModal(openId);
    }, 300); // Wait for fade out
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}


// ====== LOGIN / REGISTRATION LOGIC ======

// 1. Sign Up Flow (Does NOT open dashboard directly)
function performSignUp(event) {
    event.preventDefault(); // Prevent page reload
    
    // Simulate successful account creation
    alert("Account created successfully! Please sign in to access your dashboard.");
    
    // Automatically switch from Sign Up to Sign In
    switchModal('signupModal', 'signinModal');
}

// 2. Sign In Flow (Opens the dashboard)
function performSignIn(event) {
    event.preventDefault(); // Prevent page reload
    
    closeModal('signinModal');
    
    // Hide landing page, show dashboard
    document.getElementById('mainLandingPage').style.display = 'none';
    document.getElementById('hiringDashboard').style.display = 'block';
    
    // Scroll to top safely
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Sign Out Function
function signOut() {
    // Reset Dashboard Views to default form state
    document.getElementById('hiringForm').style.display = 'block';
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('interviewSection').style.display = 'none';
    document.getElementById('hrSimulatorTool').style.display = 'none';
    
    // Reset the Form
    document.getElementById('hiringForm').reset();
    document.getElementById('fileNameDisplay').style.display = 'none';
    
    // Switch Views Back to Landing
    document.getElementById('hiringDashboard').style.display = 'none';
    document.getElementById('mainLandingPage').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ====== FORM SUBMISSION & HR SIMULATION ======

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent page reload

    // Hide Form, Show Processing Animation (Continues indefinitely)
    document.getElementById('hiringForm').style.display = 'none';
    document.getElementById('processingSection').style.display = 'block';

    // Show the hidden HR Simulator panel so you can manually trigger the next step
    document.getElementById('hrSimulatorTool').style.display = 'block';
}

// Manually triggered by the presenter using the floating "Approve & Schedule" button
function approveCandidate() {
    // Hide processing spinner and HR Simulator panel
    document.getElementById('processingSection').style.display = 'none';
    document.getElementById('hrSimulatorTool').style.display = 'none';
    
    // Show the final Scheduled Interview view
    document.getElementById('interviewSection').style.display = 'block';
}


// ====== FILE UPLOAD INTERACTION ======
const fileInput = document.getElementById('resumeInput');
const dropZone = document.getElementById('dropZone');
const fileNameDisplay = document.getElementById('fileNameDisplay');

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        // Display the selected file name
        fileNameDisplay.innerText = "Selected: " + this.files[0].name;
        fileNameDisplay.style.display = 'block';
    } else {
        fileNameDisplay.style.display = 'none';
    }
});

// Drag and drop visual effects
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileNameDisplay.innerText = "Selected: " + e.dataTransfer.files[0].name;
        fileNameDisplay.style.display = 'block';
    }
});


// ====== SCROLL REVEAL ANIMATION ======
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});