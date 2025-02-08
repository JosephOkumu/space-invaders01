import { Player } from './player.js';
import { Alien } from './alien.js';
import { CollisionManager } from './collisionManager.js';
import { Performance } from './performance.js';

export class Game {
  constructor() {
    this.gameArea = document.getElementById('game-area');
    this.gameArea.style.width = '800px';
    this.gameArea.style.height = '600px';
    
    this.player = new Player(400, 560);
    this.aliens = [];
    this.playerProjectiles = [];
    this.alienProjectiles = [];
    this.collisionManager = new CollisionManager();
    this.performance = new Performance();
    
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.lastFrameTime = 0;
    this.lastTimerUpdate = 0;
    this.lastHUDUpdate = 0;
    
    this.setupEventListeners();
    this.createAlienFormation();
  }

  setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', () => this.startGame());
    document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    document.getElementById('continue-button').addEventListener('click', () => this.togglePause());
    document.getElementById('restart-button-pause').addEventListener('click', () => this.restartGame());
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.togglePause();
      if (this.isPaused) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') this.player.setMoving(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') this.player.setMoving(1);
      if (e.key === ' ' && !e.repeat) this.player.shoot(this.playerProjectiles);
    });
    
    window.addEventListener('keyup', (e) => {
      if (this.isPaused) return;
      if ((e.key === 'ArrowLeft' || e.key === 'a') && this.player.movingDirection === -1) this.player.setMoving(0);
      if ((e.key === 'ArrowRight' || e.key === 'd') && this.player.movingDirection === 1) this.player.setMoving(0);
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById('pause-menu').classList.toggle('hidden');
    if (!this.isPaused) {
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }

  startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    this.startTime = Date.now();
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  restartGame() {
    this.gameArea.innerHTML = '';
    this.player = new Player(400, 560);
    this.aliens = [];
    this.playerProjectiles = [];
    this.alienProjectiles = [];
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.lastFrameTime = performance.now();
    this.lastTimerUpdate = 0;
    this.lastHUDUpdate = 0;
    
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-menu').classList.add('hidden');
    this.createAlienFormation();
    this.gameLoop();
  }

  createAlienFormation() {
    const rows = 5;
    const cols = 11;
    const spacing = 50;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const alien = new Alien(
          col * spacing + 100,
          row * spacing + 50,
          this.wave
        );
        this.aliens.push(alien);
        this.gameArea.appendChild(alien.element);
      }
    }
  }

  update(deltaTime) {
    if (this.gameOver) return;
    this.player.updateInvincibility();

    // Calculate time-based movement
    const timeScale = deltaTime / 16.667; // normalize to 60 FPS

    // Update game timer less frequently
    if (performance.now() - this.lastTimerUpdate > 1000) {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(this.elapsedTime / 60);
      const seconds = this.elapsedTime % 60;
      document.getElementById('timer').textContent = 
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      this.lastTimerUpdate = performance.now();
    }

    this.player.update(this.gameArea.offsetWidth);
    
    // Batch DOM updates for aliens
    let aliensReachedBottom = false;
    const deadAliens = new Set();
    
    this.aliens.forEach((alien, index) => {
      if (!alien.update(this.gameArea.offsetWidth)) {
        deadAliens.add(index);
        return;
      }
      
      if (alien.y + alien.height >= this.gameArea.offsetHeight - 60) {
        aliensReachedBottom = true;
      }
      
      // Reduce alien shooting frequency
      if (Math.random() < 0.0005 * this.wave) {
        alien.shoot(this.alienProjectiles);
      }
    });

    // Remove dead aliens in bulk
    if (deadAliens.size > 0) {
      this.aliens = this.aliens.filter((_, index) => !deadAliens.has(index));
    }

    if (aliensReachedBottom) this.endGame();

    // Batch process projectiles
    this.processProjectiles(this.playerProjectiles);
    this.processProjectiles(this.alienProjectiles);

    // Check collisions
    this.checkCollisions();

    // Check if wave is cleared
    if (this.aliens.length === 0) {
      this.wave++;
      this.createAlienFormation();
    }

    // Update HUD less frequently
    if (performance.now() - this.lastHUDUpdate > 100) {
      this.updateHUD();
      this.lastHUDUpdate = performance.now();
    }
  }

  processProjectiles(projectiles) {
    const removeIndices = [];
    projectiles.forEach((p, index) => {
      if (!p.isActive) {
        removeIndices.push(index);
        p.element.remove();
      } else {
        p.update();
      }
    });
    
    // Remove inactive projectiles in bulk
    if (removeIndices.length > 0) {
      for (let i = removeIndices.length - 1; i >= 0; i--) {
        projectiles.splice(removeIndices[i], 1);
      }
    }
  }

  checkCollisions() {
    // Player projectiles vs aliens
    this.playerProjectiles.forEach(projectile => {
      this.aliens = this.aliens.filter(alien => {
        if (this.collisionManager.checkCollision(projectile, alien)) {
          projectile.isActive = false;
          alien.explode();
          this.score += 100;
          return false;
        }
        return true;
      });
    });
  
    // Alien projectiles vs player
    this.alienProjectiles.forEach(projectile => {
      if (
        !this.player.isInvincible && // Only check collision if player is not invincible
        this.collisionManager.checkCollision(projectile, this.player)
      ) {
        projectile.isActive = false;
        this.lives--;
        if (this.lives <= 0) {
          this.endGame();
        } else {
          this.player.activateInvincibility(); // Activate invincibility when hit
        }
      }
    });
  }

  updateHUD() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
    document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    document.getElementById('wave').textContent = `Wave: ${this.wave}`;
  }

  endGame() {
    this.gameOver = true;
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = this.score;
  }

  gameLoop(currentTime) {
    if (!this.gameOver && !this.isPaused) {
      const deltaTime = Math.min(currentTime - this.lastFrameTime, 32); // Cap at ~30 FPS minimum
      this.lastFrameTime = currentTime;

      this.performance.measure();
      this.update(deltaTime);
      
      requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }
}

new Game();