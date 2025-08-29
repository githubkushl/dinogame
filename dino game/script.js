// Enhanced Dino Game 10X - Advanced Game Engine
class DinoGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'loading';
        this.gameMode = 'classic';
        
        // Game variables
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 1;
        this.maxCombo = 1;
        this.gameSpeed = 6;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.gameTime = 0;
        this.lastTime = 0;
        this.bossActive = false;
        this.bossHealth = 0;
        this.extremeMode = false;
        
        // Game objects
        this.dino = null;
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.clouds = [];
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        
        // Power-ups
        this.activePowerUps = new Map();
        
        // Audio context for sound effects
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupCursor();
        this.loadGameData();
        this.showLoadingScreen();
        
        // Initialize audio
        this.initAudio();
        
        // Start the game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouch(e);
        });
        
        // Menu button events
        this.setupMenuEvents();
    }
    
    setupMenuEvents() {
        // Main menu buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.gameMode = e.target.dataset.mode;
                this.startGame();
            });
        });
        
        // Game over buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Pause buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
    }
    
    setupCursor() {
        const cursor = document.getElementById('cursor');
        
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX - 10,
                y: e.clientY - 10,
                duration: 0.1,
                ease: "power2.out"
            });
        });
        
        // Cursor hover effects
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 2, duration: 0.3 });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, duration: 0.3 });
            });
        });
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('dinoGame10x');
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('high-score').textContent = data.highScore || 0;
            document.getElementById('games-played').textContent = data.gamesPlayed || 0;
        }
    }
    
    saveGameData() {
        const currentHighScore = parseInt(document.getElementById('high-score').textContent);
        const currentGamesPlayed = parseInt(document.getElementById('games-played').textContent);
        
        const data = {
            highScore: Math.max(currentHighScore, this.score),
            gamesPlayed: currentGamesPlayed + 1
        };
        
        localStorage.setItem('dinoGame10x', JSON.stringify(data));
        
        document.getElementById('high-score').textContent = data.highScore;
        document.getElementById('games-played').textContent = data.gamesPlayed;
    }
    
    showLoadingScreen() {
        setTimeout(() => {
            gsap.to('#loading-screen', {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    document.getElementById('loading-screen').style.display = 'none';
                    this.showMainMenu();
                }
            });
        }, 3000);
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        this.hideAllScreens();
        
        const menuScreen = document.getElementById('main-menu');
        menuScreen.classList.add('active');
        
        // Animate menu elements
        gsap.fromTo('.title-word', 
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "bounce.out" }
        );
        
        gsap.fromTo('.menu-btn',
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.5 }
        );
        
        gsap.fromTo('.stat-item',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 1 }
        );
    }
    
    startGame() {
        this.gameState = 'playing';
        this.hideAllScreens();
        
        // Reset game variables
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.combo = 1;
        this.maxCombo = 1;
        this.gameSpeed = 6;
        this.gravity = 0.8;
        this.gameTime = 0;
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.activePowerUps.clear();
        this.bossActive = false;
        this.bossHealth = 0;
        this.extremeMode = false;
        
        // Reset canvas effects
        gsap.set(this.canvas, { filter: 'none' });
        
        // Initialize game objects
        this.initDino();
        this.initClouds();
        
        // Show game screen
        const gameScreen = document.getElementById('game-screen');
        gameScreen.classList.add('active');
        
        // Update UI
        this.updateUI();
        
        // Animate game UI
        gsap.fromTo('.ui-top > *',
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }
        );
        
        gsap.fromTo('.ui-bottom > *',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3 }
        );
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-screen').classList.add('active');
            
            gsap.fromTo('.pause-content',
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-screen').classList.remove('active');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.saveGameData();
        
        // Update final stats
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('time-survived').textContent = Math.floor(this.gameTime / 1000) + 's';
        document.getElementById('max-combo').textContent = this.maxCombo + 'x';
        
        // Show game over screen
        document.getElementById('game-over-screen').classList.add('active');
        
        // Create explosion particles
        this.createExplosion(this.dino.x, this.dino.y, 20);
        
        // Animate game over screen
        gsap.fromTo('.game-over-content',
            { scale: 0.5, opacity: 0, rotationX: -90 },
            { scale: 1, opacity: 1, rotationX: 0, duration: 1, ease: "back.out(1.7)" }
        );
        
        // Play game over sound
        this.playSound(200, 0.5, 'sawtooth');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    initDino() {
        this.dino = {
            x: 100,
            y: this.canvas.height - 150,
            width: 60,
            height: 60,
            velocityY: 0,
            isJumping: false,
            isDucking: false,
            duckStartTime: 0,
            duckCooldown: 0,
            lastScoreTime: 0,
            color: '#00ff88',
            trail: []
        };
    }
    
    initClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.3),
                width: 80 + Math.random() * 40,
                height: 40 + Math.random() * 20,
                speed: 0.5 + Math.random() * 1,
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.jump();
                }
                break;
            case 'ArrowDown':
                if (this.gameState === 'playing' && (!this.dino.duckCooldown || Date.now() > this.dino.duckCooldown)) {
                    this.duck();
                }
                break;
            case 'KeyX':
                if (this.gameState === 'playing') {
                    this.useSpecialAbility();
                }
                break;
            case 'Escape':
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                break;
        }
    }
    
    handleClick(e) {
        if (this.gameState === 'playing') {
            this.jump();
        }
    }
    
    handleTouch(e) {
        if (this.gameState === 'playing') {
            const touch = e.touches[0];
            if (touch.clientY < this.canvas.height / 2) {
                this.jump();
            } else {
                this.duck();
            }
        }
    }
    
    jump() {
        if (!this.dino.isJumping) {
            this.dino.velocityY = this.jumpPower;
            this.dino.isJumping = true;
            this.dino.isDucking = false;
            
            // Play jump sound
            this.playSound(400, 0.2);
            
            // Create jump particles
            this.createParticles(this.dino.x, this.dino.y + this.dino.height, 5, '#00ff88');
        }
    }
    
    duck() {
        if (!this.dino.isJumping && !this.dino.isDucking) {
            this.dino.isDucking = true;
            this.dino.duckStartTime = Date.now();
            
            // Prevent infinite ducking - max 1 second
            setTimeout(() => {
                this.dino.isDucking = false;
                this.dino.duckCooldown = Date.now() + 200; // 200ms cooldown
            }, 1000);
        }
    }
    
    useSpecialAbility() {
        if (this.activePowerUps.has('shield')) {
            // Shield blast
            this.createShockwave(this.dino.x, this.dino.y);
            this.obstacles = this.obstacles.filter(obstacle => {
                const distance = Math.abs(obstacle.x - this.dino.x);
                if (distance < 200) {
                    this.createExplosion(obstacle.x, obstacle.y, 10);
                    this.addScore(50);
                    return false;
                }
                return true;
            });
            
            this.playSound(600, 0.3, 'square');
        }
    }
    
    updateDino(deltaTime) {
        // Apply gravity
        if (this.dino.isJumping) {
            this.dino.velocityY += this.gravity;
            this.dino.y += this.dino.velocityY;
            
            // Check if landed
            if (this.dino.y >= this.canvas.height - 150) {
                this.dino.y = this.canvas.height - 150;
                this.dino.velocityY = 0;
                this.dino.isJumping = false;
                
                // Create landing particles
                this.createParticles(this.dino.x, this.dino.y + this.dino.height, 3, '#00ff88');
            }
        }
        
        // Update trail
        this.dino.trail.push({ x: this.dino.x + this.dino.width / 2, y: this.dino.y + this.dino.height / 2 });
        if (this.dino.trail.length > 10) {
            this.dino.trail.shift();
        }
        
        // Mouse parallax effect
        const mouseInfluence = (this.mousePos.x - this.canvas.width / 2) * 0.01;
        this.dino.x = Math.max(50, Math.min(200, 100 + mouseInfluence));
    }
    
    spawnObstacle() {
        // Increased spawn rate and difficulty scaling
        const baseSpawnRate = 0.015;
        const levelSpawnRate = this.level * 0.008;
        const spawnRate = Math.min(baseSpawnRate + levelSpawnRate, 0.08);
        
        if (Math.random() < spawnRate) {
            const types = ['cactus', 'rock', 'bird', 'spike', 'laser'];
            let availableTypes = types.slice(0, Math.min(3 + Math.floor(this.level / 3), types.length));
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            let obstacle = {
                x: this.canvas.width + 50,
                type: type,
                width: 40,
                height: 60,
                speed: this.gameSpeed + Math.random() * (2 + this.level * 0.5),
                color: '#ff6b6b',
                passed: false
            };
            
            // Level-based obstacle modifications
            if (this.level >= 5) {
                obstacle.speed *= 1.2;
                obstacle.width *= 1.1;
            }
            
            if (this.level >= 10) {
                obstacle.height *= 1.2;
                if (Math.random() < 0.3) {
                    obstacle.isMoving = true;
                    obstacle.moveDirection = Math.random() < 0.5 ? 1 : -1;
                }
            }
            
            switch (type) {
                case 'bird':
                    obstacle.y = this.canvas.height - 200 - Math.random() * 100;
                    obstacle.height = 30;
                    obstacle.wingOffset = 0;
                    break;
                case 'spike':
                    obstacle.y = this.canvas.height - 150 - obstacle.height;
                    obstacle.width = 20;
                    obstacle.height = 80;
                    obstacle.color = '#ff4444';
                    break;
                case 'laser':
                    obstacle.y = this.canvas.height - 300;
                    obstacle.width = 5;
                    obstacle.height = 200;
                    obstacle.color = '#ff0066';
                    obstacle.isLaser = true;
                    break;
                default:
                    obstacle.y = this.canvas.height - 150 - obstacle.height;
            }
            
            this.obstacles.push(obstacle);
        }
        
        // Spawn obstacle clusters at higher levels
        if (this.level >= 8 && Math.random() < 0.005) {
            this.spawnObstacleCluster();
        }
        
        // Boss battles every 5 levels
        if (this.level % 5 === 0 && this.level >= 5 && !this.bossActive && Math.random() < 0.001) {
            this.spawnBoss();
        }
    }
    
    spawnPowerUp() {
        if (Math.random() < 0.005) {
            const types = ['speed', 'shield', 'jump', 'magnet'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.powerUps.push({
                x: this.canvas.width + 50,
                y: this.canvas.height - 200 - Math.random() * 100,
                width: 30,
                height: 30,
                type: type,
                speed: this.gameSpeed * 0.8,
                rotation: 0,
                pulse: 0
            });
        }
    }
    
    updateObstacles(deltaTime) {
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= obstacle.speed;
            
            // Enhanced obstacle behaviors
            if (obstacle.type === 'bird') {
                obstacle.wingOffset += 0.3;
                obstacle.y += Math.sin(obstacle.wingOffset) * 2;
            }
            
            if (obstacle.type === 'boss') {
                // Boss AI behavior
                obstacle.attackTimer += deltaTime;
                obstacle.movePattern += 0.02;
                
                // Boss movement pattern
                obstacle.y += Math.sin(obstacle.movePattern) * 3;
                
                // Boss attacks
                if (obstacle.attackTimer > 2000) {
                    this.spawnBossAttack(obstacle);
                    obstacle.attackTimer = 0;
                }
                
                // Boss health management
                if (obstacle.health <= 0) {
                    this.defeatBoss(obstacle, index);
                    return;
                }
            }
            
            if (obstacle.isMoving) {
                obstacle.y += obstacle.moveDirection * 2;
                if (obstacle.y < this.canvas.height - 300 || obstacle.y > this.canvas.height - 100) {
                    obstacle.moveDirection *= -1;
                }
            }
            
            // Score only when obstacle is passed (not just spawned)
            if (!obstacle.passed && obstacle.x + obstacle.width < this.dino.x) {
                obstacle.passed = true;
                const now = Date.now();
                
                // Prevent score farming - minimum time between scores
                if (now - this.dino.lastScoreTime > 100) {
                    this.dino.lastScoreTime = now;
                    let points = 10;
                    
                    // Bonus points for harder obstacles
                    if (obstacle.type === 'spike') points = 15;
                    if (obstacle.type === 'laser') points = 20;
                    if (obstacle.isMoving) points *= 1.5;
                    
                    this.addScore(Math.floor(points));
                }
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < -100) {
                this.obstacles.splice(index, 1);
            }
            
            // Collision detection
            if (this.checkCollision(this.dino, obstacle)) {
                if (this.activePowerUps.has('shield')) {
                    if (obstacle.type === 'boss') {
                        // Damage boss with shield
                        obstacle.health -= 20;
                        this.createExplosion(obstacle.x, obstacle.y, 8);
                        this.addScore(50);
                        this.playSound(500, 0.2, 'square');
                        
                        // Boss knockback
                        obstacle.x += 20;
                    } else {
                        // Destroy regular obstacle with shield
                        this.obstacles.splice(index, 1);
                        this.createExplosion(obstacle.x, obstacle.y, 8);
                        this.addScore(25);
                        this.playSound(500, 0.2, 'square');
                    }
                } else {
                    if (obstacle.type === 'boss') {
                        // Boss collision causes more damage
                        this.takeDamage();
                        this.takeDamage(); // Double damage from boss
                    } else {
                        this.takeDamage();
                    }
                }
            }
        });
    }
    
    updatePowerUps(deltaTime) {
        this.powerUps.forEach((powerUp, index) => {
            powerUp.x -= powerUp.speed;
            powerUp.rotation += 0.1;
            powerUp.pulse += 0.2;
            
            // Remove off-screen power-ups
            if (powerUp.x + powerUp.width < 0) {
                this.powerUps.splice(index, 1);
            }
            
            // Collection detection
            if (this.checkCollision(this.dino, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    collectPowerUp(powerUp) {
        this.activePowerUps.set(powerUp.type, Date.now() + 10000); // 10 seconds
        this.createParticles(powerUp.x, powerUp.y, 8, '#4ecdc4');
        this.playSound(800, 0.3);
        this.updatePowerUpUI();
        
        // Apply immediate effects
        switch (powerUp.type) {
            case 'speed':
                this.gameSpeed *= 0.7; // Slow down obstacles
                break;
            case 'jump':
                this.jumpPower = -20;
                break;
        }
    }
    
    updatePowerUpUI() {
        const powerUpContainer = document.getElementById('power-ups');
        powerUpContainer.innerHTML = '';
        
        this.activePowerUps.forEach((expiry, type) => {
            if (Date.now() < expiry) {
                const powerUpElement = document.createElement('div');
                powerUpElement.className = 'power-up';
                powerUpElement.textContent = this.getPowerUpIcon(type);
                powerUpContainer.appendChild(powerUpElement);
            } else {
                this.activePowerUps.delete(type);
                // Reset effects
                if (type === 'speed') this.gameSpeed = 6 + this.level;
                if (type === 'jump') this.jumpPower = -15;
            }
        });
    }
    
    getPowerUpIcon(type) {
        const icons = {
            speed: '⚡',
            shield: '🛡️',
            jump: '🦘',
            magnet: '🧲'
        };
        return icons[type] || '?';
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateClouds(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width + Math.random() * 200;
                cloud.y = Math.random() * (this.canvas.height * 0.3);
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        const margin = 10; // Collision margin for better gameplay
        return rect1.x < rect2.x + rect2.width - margin &&
               rect1.x + rect1.width > rect2.x + margin &&
               rect1.y < rect2.y + rect2.height - margin &&
               rect1.y + rect1.height > rect2.y + margin;
    }
    
    takeDamage() {
        this.lives--;
        this.combo = 1;
        this.updateUI();
        
        // Screen shake effect
        gsap.to(this.canvas, {
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                gsap.set(this.canvas, { x: 0, y: 0 });
            }
        });
        
        // Create damage particles
        this.createParticles(this.dino.x, this.dino.y, 10, '#ff6b6b');
        
        // Play damage sound
        this.playSound(200, 0.5, 'sawtooth');
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    addScore(points) {
        this.score += Math.floor(points * this.combo);
        
        // Combo system with decay
        this.combo = Math.min(this.combo + 0.05, 5);
        this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));
        
        // Combo decay over time
        if (Date.now() - this.dino.lastScoreTime > 2000) {
            this.combo = Math.max(1, this.combo - 0.1);
        }
        
        // More challenging level progression
        const newLevel = Math.floor(this.score / 1500) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed += 0.8;
            this.gravity += 0.1;
            this.createLevelUpEffect();
            
            // Unlock new mechanics at certain levels
            if (this.level === 5) {
                this.showLevelMessage("Moving obstacles unlocked!");
            }
            if (this.level === 10) {
                this.showLevelMessage("Laser obstacles incoming!");
            }
            if (this.level === 15) {
                this.extremeMode = true;
                this.showLevelMessage("EXTREME MODE ACTIVATED!");
                this.activateExtremeMode();
            }
            if (this.level === 20) {
                this.showLevelMessage("NIGHTMARE DIFFICULTY!");
            }
        }
        
        this.updateUI();
    }
    
    spawnObstacleCluster() {
        const clusterSize = 2 + Math.floor(Math.random() * 3);
        const baseX = this.canvas.width + 50;
        
        for (let i = 0; i < clusterSize; i++) {
            const obstacle = {
                x: baseX + (i * 80),
                y: this.canvas.height - 150 - 60,
                width: 30,
                height: 60,
                type: 'cactus',
                speed: this.gameSpeed + Math.random() * 2,
                color: '#ff6b6b',
                passed: false,
                isCluster: true
            };
            this.obstacles.push(obstacle);
        }
    }
    
    spawnBoss() {
        this.bossActive = true;
        this.bossHealth = 100;
        
        const boss = {
            x: this.canvas.width + 100,
            y: this.canvas.height - 250,
            width: 120,
            height: 100,
            type: 'boss',
            speed: this.gameSpeed * 0.5,
            color: '#ff0000',
            health: 100,
            maxHealth: 100,
            attackTimer: 0,
            movePattern: 0,
            isBoss: true,
            passed: false
        };
        
        this.obstacles.push(boss);
        this.showLevelMessage(`BOSS BATTLE - LEVEL ${this.level}!`);
        this.playSound(300, 1, 'sawtooth');
    }
    
    activateExtremeMode() {
        // Increase all difficulty parameters
        this.gameSpeed *= 1.5;
        this.gravity *= 1.3;
        
        // Add screen distortion effects
        const canvas = this.canvas;
        gsap.to(canvas, {
            filter: 'hue-rotate(180deg) contrast(1.2)',
            duration: 2,
            repeat: -1,
            yoyo: true
        });
        
        // Spawn more frequent obstacles
        setInterval(() => {
            if (this.gameState === 'playing' && this.extremeMode) {
                if (Math.random() < 0.3) {
                    this.spawnObstacle();
                }
            }
        }, 1000);
    }
    
    spawnBossAttack(boss) {
        // Spawn projectiles from boss
        for (let i = 0; i < 3; i++) {
            this.obstacles.push({
                x: boss.x + boss.width / 2,
                y: boss.y + boss.height / 2 + (i - 1) * 30,
                width: 15,
                height: 15,
                speed: this.gameSpeed * 1.5,
                type: 'laser',
                color: '#ff4444',
                damage: 2,
                passed: false
            });
        }
        
        // Boss attack sound
        this.playSound(200, 0.3, 'sawtooth');
    }
    
    defeatBoss(boss, index) {
        // Remove boss
        this.obstacles.splice(index, 1);
        
        // Massive explosion
        this.createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 20);
        
        // Screen shake
        this.screenShake = 30;
        
        // Bonus score
        this.addScore(500);
        
        // Boss defeat sound
        this.playSound(100, 0.5, 'square');
        
        // Reset boss state
        this.bossActive = false;
        this.bossHealth = 0;
        
        // Show victory message
        this.showLevelMessage('BOSS DEFEATED!');
        
        // Bonus life for defeating boss
        this.lives = Math.min(this.lives + 1, 5);
    }
    
    showLevelMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 136, 0.9);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.5rem;
            z-index: 1001;
            pointer-events: none;
        `;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        gsap.fromTo(messageEl, 
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
        
        gsap.to(messageEl, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            delay: 2,
            onComplete: () => messageEl.remove()
        });
    }
    
    createLevelUpEffect() {
        // Screen flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 136, 0.3);
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(flash);
        
        gsap.to(flash, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => flash.remove()
        });
        
        // Play level up sound
        this.playSound(600, 0.5);
        this.playSound(800, 0.3, 'square');
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                life: 1000,
                maxLife: 1000,
                alpha: 1,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }
    
    createExplosion(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 800,
                maxLife: 800,
                alpha: 1,
                color: ['#ff6b6b', '#ffd93d', '#ff8c42'][Math.floor(Math.random() * 3)],
                size: 3 + Math.random() * 6
            });
        }
    }
    
    createShockwave(x, y) {
        // Visual shockwave effect
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border: 3px solid #00ff88;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(shockwave);
        
        gsap.to(shockwave, {
            width: 400,
            height: 400,
            x: -200,
            y: -200,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => shockwave.remove()
        });
    }
    
    updateUI() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('current-level').textContent = this.level;
        
        // Update lives display
        const livesDisplay = document.getElementById('lives-display');
        livesDisplay.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const life = document.createElement('div');
            life.className = 'life-icon';
            livesDisplay.appendChild(life);
        }
        
        // Update combo meter
        const comboFill = document.getElementById('combo-fill');
        const comboText = document.getElementById('combo-text');
        const comboPercent = ((this.combo - 1) / 4) * 100;
        comboFill.style.width = comboPercent + '%';
        comboText.textContent = `COMBO x${Math.floor(this.combo)}`;
        
        this.updatePowerUpUI();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(26, 26, 46, 0.8)');
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0.9)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.renderClouds();
        
        // Draw ground
        this.renderGround();
        
        // Draw game objects
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.renderDino();
            this.renderObstacles();
            this.renderPowerUps();
        }
        
        // Draw particles
        this.renderParticles();
        
        // Draw parallax background elements
        this.renderParallaxElements();
    }
    
    renderClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.clouds.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        });
        this.ctx.globalAlpha = 1;
    }
    
    renderGround() {
        const groundY = this.canvas.height - 100;
        
        // Ground line with glow effect
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.canvas.width, groundY);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Ground pattern
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        for (let i = 0; i < this.canvas.width; i += 50) {
            const offset = (this.gameTime * 0.1) % 50;
            this.ctx.fillRect(i - offset, groundY, 2, 20);
        }
    }
    
    renderDino() {
        const dino = this.dino;
        
        // Draw trail
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        dino.trail.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.stroke();
        
        // Draw dino with glow effect
        this.ctx.fillStyle = dino.color;
        this.ctx.shadowColor = dino.color;
        this.ctx.shadowBlur = 15;
        
        // Dino body (simplified geometric shape)
        const dinoHeight = dino.isDucking ? dino.height * 0.6 : dino.height;
        const dinoY = dino.isDucking ? dino.y + dino.height * 0.4 : dino.y;
        
        // Main body
        this.ctx.fillRect(dino.x, dinoY, dino.width, dinoHeight);
        
        // Head
        this.ctx.fillRect(dino.x + dino.width * 0.7, dinoY - 20, 25, 25);
        
        // Legs (animated)
        const legOffset = Math.sin(this.gameTime * 0.01) * 5;
        this.ctx.fillRect(dino.x + 10, dinoY + dinoHeight, 8, 15 + legOffset);
        this.ctx.fillRect(dino.x + 30, dinoY + dinoHeight, 8, 15 - legOffset);
        
        this.ctx.shadowBlur = 0;
        
        // Shield effect
        if (this.activePowerUps.has('shield')) {
            this.ctx.strokeStyle = '#4ecdc4';
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 20;
            
            const shieldRadius = 50 + Math.sin(this.gameTime * 0.01) * 5;
            this.ctx.beginPath();
            this.ctx.arc(dino.x + dino.width / 2, dino.y + dino.height / 2, shieldRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.shadowColor = obstacle.color;
            this.ctx.shadowBlur = 10;
            
            switch (obstacle.type) {
                case 'bird':
                    // Animated bird
                    const wingSpan = 20 + Math.sin(obstacle.wingOffset) * 10;
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.fillRect(obstacle.x - wingSpan/2, obstacle.y + 5, wingSpan, 5);
                    break;
                    
                case 'spike':
                    // Sharp spike obstacle
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    // Add danger spikes
                    this.ctx.fillStyle = '#ff0000';
                    for (let i = 0; i < 4; i++) {
                        this.ctx.fillRect(obstacle.x + 2, obstacle.y + i * 20, 16, 8);
                    }
                    break;
                    
                case 'laser':
                     // Pulsing laser beam
                     const pulseIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
                     this.ctx.globalAlpha = pulseIntensity;
                     this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                     
                     // Laser glow effect
                     this.ctx.shadowBlur = 20;
                     this.ctx.fillRect(obstacle.x - 2, obstacle.y, obstacle.width + 4, obstacle.height);
                     this.ctx.globalAlpha = 1;
                     break;
                     
                 case 'boss':
                     // Boss rendering with health bar
                     this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                     
                     // Boss details
                     this.ctx.fillStyle = '#ff4444';
                     this.ctx.fillRect(obstacle.x + 10, obstacle.y + 10, 20, 20); // Eye
                     this.ctx.fillRect(obstacle.x + 80, obstacle.y + 10, 20, 20); // Eye
                     
                     // Boss health bar
                     const healthBarWidth = 100;
                     const healthBarHeight = 8;
                     const healthPercent = obstacle.health / obstacle.maxHealth;
                     
                     this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                     this.ctx.fillRect(obstacle.x + 10, obstacle.y - 20, healthBarWidth, healthBarHeight);
                     
                     this.ctx.fillStyle = '#ff0000';
                     this.ctx.fillRect(obstacle.x + 10, obstacle.y - 20, healthBarWidth * healthPercent, healthBarHeight);
                     
                     // Boss aura
                     this.ctx.strokeStyle = '#ff0000';
                     this.ctx.lineWidth = 3;
                     this.ctx.shadowBlur = 30;
                     this.ctx.strokeRect(obstacle.x - 10, obstacle.y - 10, obstacle.width + 20, obstacle.height + 20);
                     break;
                    
                case 'cactus':
                    // Enhanced cactus
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    // Add spikes
                    for (let i = 0; i < 3; i++) {
                        this.ctx.fillRect(obstacle.x + i * 15, obstacle.y - 10, 5, 15);
                    }
                    break;
                    
                default:
                    // Rock or other obstacles
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
            }
            
            // Moving obstacle indicator
            if (obstacle.isMoving) {
                this.ctx.strokeStyle = '#ffff00';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(obstacle.x - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 10);
            }
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            const pulseSize = 5 + Math.sin(powerUp.pulse) * 3;
            
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate(powerUp.rotation);
            
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 15;
            
            this.ctx.fillRect(-powerUp.width / 2 - pulseSize / 2, -powerUp.height / 2 - pulseSize / 2, 
                             powerUp.width + pulseSize, powerUp.height + pulseSize);
            
            this.ctx.restore();
            this.ctx.shadowBlur = 0;
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    renderParallaxElements() {
        // Moving background elements for depth
        const parallaxOffset = (this.gameTime * 0.02) % this.canvas.width;
        
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
        for (let i = -100; i < this.canvas.width + 100; i += 100) {
            const x = i - parallaxOffset;
            this.ctx.fillRect(x, 0, 2, this.canvas.height);
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing') {
            this.gameTime += deltaTime;
            
            // Update game objects
            this.updateDino(deltaTime);
            this.spawnObstacle();
            this.spawnPowerUp();
            this.updateObstacles(deltaTime);
            this.updatePowerUps(deltaTime);
            this.updateParticles(deltaTime);
            this.updateClouds(deltaTime);
        }
        
        // Always render
        this.render();
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new DinoGame();
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });