document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const statusText = document.getElementById('status-text');
    const loaderContainer = document.getElementById('loader-container');

    // Configuration
    const TOTAL_LOADING_TIME = 4500; // 4.5 seconds total load time
    let currentProgress = 0;
    let startTime = null;

    // Futuristic Text Orchestration
    const loadingPhases = [
        { progress: 0, text: "Initializing Core Systems..." },
        { progress: 20, text: "Compiling 3D Assets..." },
        { progress: 45, text: "Connecting to Oppty Secure Server..." },
        { progress: 75, text: "Rendering Cinematic UI..." },
        { progress: 95, text: "Finalizing Experience..." }
    ];

    let currentPhaseIndex = 0;

    // Text transition logic
    function updateStatusText(newText) {
        statusText.classList.remove('fade-in');
        statusText.classList.add('fade-out');
        
        setTimeout(() => {
            statusText.textContent = newText;
            statusText.classList.remove('fade-out');
            statusText.classList.add('fade-in');
        }, 400); // Matches CSS transition time
    }

    // High-performance animation loop (60fps)
    function animateLoading(timestamp) {
        if (!startTime) startTime = timestamp;
        
        // Calculate elapsed time and progress
        const elapsed = timestamp - startTime;
        
        // Easing function for natural, non-linear progress (ease-out cubic)
        const progressRatio = Math.min(elapsed / TOTAL_LOADING_TIME, 1);
        const easedProgress = 1 - Math.pow(1 - progressRatio, 3); 
        
        currentProgress = Math.floor(easedProgress * 100);

        // Update DOM
        progressFill.style.width = `${currentProgress}%`;
        progressPercentage.textContent = `${currentProgress}%`;

        // Check for text phase updates
        const nextPhase = loadingPhases[currentPhaseIndex + 1];
        if (nextPhase && currentProgress >= nextPhase.progress) {
            currentPhaseIndex++;
            updateStatusText(nextPhase.text);
        }

        // Continue loop or finish
        if (currentProgress < 100) {
            requestAnimationFrame(animateLoading);
        } else {
            completeLoading();
        }
    }

    // Final sequence
    function completeLoading() {
        updateStatusText("Ready.");
        
        // Add a slight delay before hiding the loader for user to see 100%
        setTimeout(() => {
            loaderContainer.classList.add('fade-out');
            
            // Trigger your actual app initialization here
            console.log("Oppty Loading Complete. Initializing Main App...");
            
            // Optional: Remove loader from DOM after transition
            // setTimeout(() => loaderContainer.remove(), 800);
        }, 600);
    }

    // Start the engine
    requestAnimationFrame(animateLoading);
});