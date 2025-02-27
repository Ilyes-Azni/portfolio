// Update copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Creative Mathematical Morphing Visualization
document.addEventListener('DOMContentLoaded', () => {
    // Check if the canvas element exists
    const canvas = document.getElementById('optimization-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Clean white background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10); // Position camera to look straight at the visualization
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Main container for all visualizations
    const group = new THREE.Group();
    scene.add(group);
    
    // Add subtle lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create all three visualizations
    const sineWave = createSineWave();
    const goldenSpiral = createGoldenSpiral();
    const linearFunction = createLinearFunction();
    
    // Add them to the scene but initially hide the latter two
    group.add(sineWave);
    group.add(goldenSpiral);
    group.add(linearFunction);
    
    goldenSpiral.visible = false;
    linearFunction.visible = false;
    
    // Parameters for the animations and transitions
    let currentState = 0; // 0 = sine, 1 = golden ratio, 2 = linear
    let transitionProgress = 0;
    let isTransitioning = false;
    const transitionDuration = 3.0; // seconds
    let startTime = 0;
    
    // Functions to create each visualization component
    function createSineWave() {
        const sineGroup = new THREE.Group();
        
        // Create a smooth sine curve
        const points = [];
        const segments = 100;
        const amplitude = 2;
        const waves = 2;
        
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * 8 - 4; // Range from -4 to 4
            const y = Math.sin(x * Math.PI * waves / 4) * amplitude;
            points.push(new THREE.Vector3(x, y, 0));
        }
        
        // Create the line
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x3498db, 
            linewidth: 2,
        });
        
        const sineCurve = new THREE.Line(geometry, material);
        sineGroup.add(sineCurve);
        
        // Add floating points along the curve
        const pointsGroup = new THREE.Group();
        sineGroup.add(pointsGroup);
        
        for (let i = 0; i < 8; i++) {
            const point = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xff3366 })
            );
            
            // Position will be updated in the animation
            pointsGroup.add(point);
        }
        
        // Animation function for the sine wave
        sineGroup.animate = (time) => {
            for (let i = 0; i < pointsGroup.children.length; i++) {
                const t = (time * 0.5 + i * 0.5) % (Math.PI * 2); // Offset each point
                const x = Math.cos(t) * 3; // Circular x movement
                const idx = Math.floor((x + 4) / 8 * segments); // Map to our sine points
                const clampedIdx = Math.max(0, Math.min(idx, segments));
                
                // Get the y value from our sine wave
                const y = points[clampedIdx].y;
                
                pointsGroup.children[i].position.set(x, y, 0);
            }
        };
        
        return sineGroup;
    }
    
    function createGoldenSpiral() {
        const spiralGroup = new THREE.Group();
        
        // Golden ratio
        const phi = (1 + Math.sqrt(5)) / 2;
        
        // Create points for the golden spiral
        const points = [];
        const totalPoints = 200;
        const maxAngle = 6 * Math.PI; // About 3 full turns
        
        for (let i = 0; i <= totalPoints; i++) {
            const angle = (i / totalPoints) * maxAngle;
            const radius = Math.pow(phi, 2 * angle / Math.PI) / 10;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, 0));
        }
        
        // Create the spiral curve
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x9b59b6, // Purple for the golden spiral 
            linewidth: 2,
        });
        
        const spiral = new THREE.Line(geometry, material);
        spiralGroup.add(spiral);
        
        // Add golden rectangles
        const rectangles = new THREE.Group();
        spiralGroup.add(rectangles);
        
        // Create a series of nested golden rectangles
        let size = 3;
        let x = 0, y = 0;
        
        for (let i = 0; i < 5; i++) {
            const rectangle = createRectangle(size, size / phi, 0x9b59b6, 0.3);
            rectangle.position.set(x, y, 0);
            rectangles.add(rectangle);
            
            // Calculate next position and size
            x += size / 2;
            y += size / phi / 2;
            size = size / phi;
        }
        
        // Add a phi (φ) symbol
        const phiTextMesh = createTextMesh("φ = " + phi.toFixed(3), 0x9b59b6);
        phiTextMesh.position.set(-3, -2, 0);
        spiralGroup.add(phiTextMesh);
        
        // Animation function
        spiralGroup.animate = (time) => {
            // Gentle rotation for the golden spiral visualization
            spiralGroup.rotation.z = Math.sin(time * 0.1) * 0.05;
        };
        
        return spiralGroup;
    }
    
    function createLinearFunction() {
        const linearGroup = new THREE.Group();
        
        // Create a line for ax + b
        const a = 0.8;  // Slope
        const b = -1;   // Y-intercept
        
        const points = [];
        for (let x = -5; x <= 5; x += 0.1) {
            const y = a * x + b;
            points.push(new THREE.Vector3(x, y, 0));
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x2ecc71, // Green for the linear function
            linewidth: 2,
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        linearGroup.add(line);
        
        // Add the formula text
        const formula = `f(x) = ${a}x ${b < 0 ? '- ' + Math.abs(b) : '+ ' + b}`;
        const textMesh = createTextMesh(formula, 0x2ecc71);
        textMesh.position.set(-3, 3, 0);
        linearGroup.add(textMesh);
        
        // Add point that moves along the line
        const point = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff3366 })
        );
        linearGroup.add(point);
        
        // Animation function
        linearGroup.animate = (time) => {
            const x = Math.sin(time * 0.5) * 4; // Move between -4 and 4
            const y = a * x + b;
            point.position.set(x, y, 0);
        };
        
        return linearGroup;
    }
    
    // Helper function for creating text meshes (simulated with a plane)
    function createTextMesh(text, color) {
        // Since THREE.js doesn't have built-in text rendering, we'll use a placeholder
        // In a real implementation, you'd use a library like troika-three-text or create a sprite
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5),
            new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8
            })
        );
        
        // In a complete implementation, you would render text here
        // For simplicity, we're just using a colored plane
        
        return mesh;
    }
    
    // Helper to create a rectangle
    function createRectangle(width, height, color, opacity = 1.0) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    // Handle transitions between states
    function updateTransition(time) {
        if (!isTransitioning) return;
        
        const elapsed = time - startTime;
        transitionProgress = Math.min(elapsed / (transitionDuration * 1000), 1.0);
        
        if (transitionProgress >= 1.0) {
            transitionProgress = 0;
            isTransitioning = false;
            
            // Complete the transition
            if (currentState === 0) {
                sineWave.visible = false;
                goldenSpiral.visible = true;
                currentState = 1;
            } else if (currentState === 1) {
                goldenSpiral.visible = false;
                linearFunction.visible = true;
                currentState = 2;
            } else {
                linearFunction.visible = false;
                sineWave.visible = true;
                currentState = 0;
            }
        } else {
            // During transition, adjust position, scale, or opacity as needed
            if (currentState === 0) {
                // Transitioning from sine to golden spiral
                sineWave.scale.set(1 - transitionProgress, 1 - transitionProgress, 1);
                goldenSpiral.scale.set(transitionProgress, transitionProgress, 1);
                sineWave.material.opacity = 1 - transitionProgress;
                goldenSpiral.visible = true;
                goldenSpiral.material.opacity = transitionProgress;
            } else if (currentState === 1) {
                // Transitioning from golden spiral to linear
                goldenSpiral.scale.set(1 - transitionProgress, 1 - transitionProgress, 1);
                linearFunction.scale.set(transitionProgress, transitionProgress, 1);
                goldenSpiral.material.opacity = 1 - transitionProgress;
                linearFunction.visible = true;
                linearFunction.material.opacity = transitionProgress;
            } else {
                // Transitioning from linear back to sine
                linearFunction.scale.set(1 - transitionProgress, 1 - transitionProgress, 1);
                sineWave.scale.set(transitionProgress, transitionProgress, 1);
                linearFunction.material.opacity = 1 - transitionProgress;
                sineWave.visible = true;
                sineWave.material.opacity = transitionProgress;
            }
        }
    }
    
    // Enhanced window resize handler
    window.addEventListener('resize', () => {
        if (!canvas) return;
        
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
    });
    
    // Initial resize to ensure proper sizing
    window.dispatchEvent(new Event('resize'));
    
    // Animation loop
    function animate(time) {
        time = time || 0;
        requestAnimationFrame(animate);
        
        // Animate the current visualization
        if (sineWave.visible) sineWave.animate(time * 0.001);
        if (goldenSpiral.visible) goldenSpiral.animate(time * 0.001);
        if (linearFunction.visible) linearFunction.animate(time * 0.001);
        
        // Handle transitions
        updateTransition(time);
        
        // Start transition if not already in one, every 8 seconds
        if (!isTransitioning && time % 8000 < 16) {
            isTransitioning = true;
            startTime = time;
        }
        
        renderer.render(scene, camera);
    }
    
    // Start the animation
    animate();
});

// Add animated background particles
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles-background');
    if (!particlesContainer) return;
    
    // Create particles
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size (small)
        const size = Math.random() * 5 + 2;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Random color (blues and light tones)
        const colors = ['rgba(173, 216, 230, ', 'rgba(135, 206, 235, ', 'rgba(240, 248, 255, ', 'rgba(245, 245, 245, '];
        const color = colors[Math.floor(Math.random() * colors.length)] + opacity + ')';
        
        // Set CSS properties
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        
        // Animation duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        // Add to container
        container.appendChild(particle);
    }
});

// Add keyframe animation via JavaScript since it's dynamic
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
@keyframes float {
    0%, 100% {
        transform: translateY(0) translateX(0);
    }
    25% {
        transform: translateY(-20px) translateX(10px);
    }
    50% {
        transform: translateY(-35px) translateX(-10px);
    }
    75% {
        transform: translateY(-20px) translateX(10px);
    }
}

.particle {
    opacity: 0;
    animation-fill-mode: both;
    transition: opacity 1s ease;
}
`;
document.head.appendChild(styleSheet);

// Make particles visible after a slight delay
setTimeout(() => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.opacity = '1';
    });
}, 500);
