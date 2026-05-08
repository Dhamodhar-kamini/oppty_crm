let scene, camera, renderer, composer, clock;
let asteroid, explosionParticles;
let dinoMixers = []; // For skeletal walking/fighting animations

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 8, 30);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('world'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Realistic soft shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic color grading
    renderer.toneMappingExposure = 1.0;

    clock = new THREE.Clock();

    // 2. Post-Processing (Bloom for glowing asteroid and fires)
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 3. Environment & Lighting
    createEnvironment();
    
    // 4. Load Models & Effects
    loadRealisticModels();
    createAsteroid();
    createExplosionSystem();

    // Resize Handler
    window.addEventListener('resize', onWindowResize);
    
    animate();
}

function createEnvironment() {
    // Ambient moon/starlight
    const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
    scene.add(ambientLight);

    // Cinematic directional rim light
    const dirLight = new THREE.DirectionalLight(0x4455aa, 1.5);
    dirLight.position.set(-20, 30, -10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // High-res realistic ground (Replace material map with real textures if desired)
    const groundGeo = new THREE.PlaneGeometry(500, 500, 100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x0a0a0c, 
        roughness: 0.9, 
        metalness: 0.1,
        displacementScale: 2 
    });
    
    // Add procedural bumpiness to ground
    const positions = groundGeo.attributes.position;
    for(let i=0; i<positions.count; i++) {
        positions.setZ(i, Math.random() * 0.5); 
    }
    
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function loadRealisticModels() {
    const loader = new THREE.GLTFLoader();
    
    // =========================================================================
    // ⚠️ IMPORTANT: To make this hyper-realistic, download a free GLTF dinosaur 
    // model from Sketchfab and place it in your folder. Update the path below.
    // Example: loader.load('models/trex.glb', function(gltf) { ... });
    // =========================================================================
    
    // Fallback: If no model is found, we log a warning but the asteroid will still work.
    console.warn("Place realistic '.glb' or '.gltf' dinosaur models in your directory to replace this placeholder logic.");
    
    // Hide loading screen and show button assuming models loaded
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('start-btn').style.display = 'block';
        }, 1000);
    }, 1500);
}

function createAsteroid() {
    // The core of the asteroid
    const geo = new THREE.IcosahedronGeometry(3, 2);
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        emissive: 0xff4500, 
        emissiveIntensity: 5, // Triggers the bloom effect
        roughness: 1 
    });
    asteroid = new THREE.Mesh(geo, mat);
    asteroid.position.set(100, 120, -50);
    asteroid.visible = false;
    scene.add(asteroid);

    // Add a point light to the asteroid so it illuminates the ground as it falls
    const asteroidLight = new THREE.PointLight(0xff4500, 10, 200);
    asteroid.add(asteroidLight);
}

function createExplosionSystem() {
    const count = 5000; // High particle count for realism
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];

    for (let i = 0; i < count; i++) {
        pos[i * 3] = 0; pos[i * 3 + 1] = -50; pos[i * 3 + 2] = 0; // Hide underground initially
        
        // Spherical explosion physics
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        const vx = Math.cos(theta) * Math.sin(phi);
        const vy = Math.abs(Math.cos(phi)) + 0.5; // Bias upwards
        const vz = Math.sin(theta) * Math.sin(phi);
        
        const speed = Math.random() * 5 + 2;
        vel.push(new THREE.Vector3(vx * speed, vy * speed, vz * speed));
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    // Realistic fire/dust particle material
    const mat = new THREE.PointsMaterial({ 
        color: 0xff5500, 
        size: 0.4, 
        transparent: true, 
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    explosionParticles = new THREE.Points(geo, mat);
    explosionParticles.userData.velocities = vel;
    scene.add(explosionParticles);
}

let isExploded = false;

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-btn').style.display = 'none';
    asteroid.visible = true;

    const tl = gsap.timeline();

    // 1. Asteroid enters atmosphere (Fast!)
    tl.to(asteroid.position, { 
        x: 0, y: 0, z: -10, 
        duration: 2.0, 
        ease: "power2.in" 
    }, 0);
    
    // Dynamic Camera tracking the asteroid
    tl.to(camera.position, { z: 20, y: 5, duration: 1.8, ease: "sine.inOut" }, 0);

    // 2. The Impact Event
    tl.add(() => {
        isExploded = true;
        asteroid.visible = false;
        
        // Flash of light on impact
        const flash = new THREE.PointLight(0xffaa00, 50, 500);
        flash.position.set(0, 5, -10);
        scene.add(flash);
        gsap.to(flash, { intensity: 0, duration: 2 });

        // Trigger Explosion Particles
        explosionParticles.material.opacity = 1;
        
        // Massive Cinematic Screen Shake
        gsap.fromTo(camera.position, 
            { x: -2, y: 3 }, 
            { x: 0, y: 5, duration: 0.5, ease: "elastic.out(1, 0.1)" }
        );

        // Logo Reveal Sequence
        setTimeout(() => {
            document.getElementById('logo-container').classList.add('reveal-logo');
        }, 800);
    });

    // 3. Slow pan out after destruction
    tl.to(camera.position, { z: 40, y: 15, duration: 5, ease: "power2.out" });
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Update skeletal animations if models are loaded
    dinoMixers.forEach(mixer => mixer.update(delta));

    // Physics simulation for explosion
    if (isExploded) {
        const pos = explosionParticles.geometry.attributes.position.array;
        const vels = explosionParticles.userData.velocities;
        
        for (let i = 0; i < vels.length; i++) {
            pos[i * 3] += vels[i].x;
            pos[i * 3 + 1] += vels[i].y;
            pos[i * 3 + 2] += vels[i].z;
            
            // Gravity & Air Resistance
            vels[i].y -= 0.05; 
            vels[i].x *= 0.98;
            vels[i].z *= 0.98;
            
            // Floor collision for particles
            if(pos[i * 3 + 1] < 0) {
                pos[i * 3 + 1] = 0;
                vels[i].y *= -0.3; // Bounce
            }
        }
        explosionParticles.geometry.attributes.position.needsUpdate = true;
        
        // Particles cool down and fade out (Orange to Grey)
        explosionParticles.material.opacity = Math.max(0, explosionParticles.material.opacity - 0.005);
        if(explosionParticles.material.color.g > 0.1) {
            explosionParticles.material.color.g -= 0.01; // Shifts from orange to red
        }
    }

    // Use Composer for the Bloom effect instead of standard renderer
    composer.render();
}