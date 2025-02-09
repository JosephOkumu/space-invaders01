import { Projectile } from './projectile.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 48;
    this.speed = 5;
    this.movingDirection = 0;

    // Invincibility properties
    this.isInvincible = false;
    this.invincibilityDuration = 2000; // 2 seconds
    this.invincibilityEndTime = 0;
    this.blinkInterval = null; // Interval for blinking

    // Load the shoot sound
    this.shootSound = new Audio('./shoot.wav'); 

    this.element = document.createElement('div');
    this.element.className = 'game-object player';
    document.getElementById('game-area').appendChild(this.element);
    this.updatePosition();
  }

  // Add a method to activate invincibility
  activateInvincibility() {
    this.isInvincible = true;
    this.invincibilityEndTime = Date.now() + this.invincibilityDuration;

    // Start blinking
    this.startBlinking();
  }

  // Add a method to start blinking
  startBlinking() {
    const blinkSpeed = 200; // Blink every 200ms
    this.blinkInterval = setInterval(() => {
      this.element.style.opacity = this.element.style.opacity === '0.5' ? '1' : '0.5';
    }, blinkSpeed);
  }

  // Add a method to stop blinking
  stopBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval); // Stop the blinking interval
      this.blinkInterval = null;
    }
    this.element.style.opacity = '1'; // Ensure player is fully visible
  }

  // Add a method to update invincibility state
  updateInvincibility() {
    if (this.isInvincible && Date.now() >= this.invincibilityEndTime) {
      this.isInvincible = false;
      this.stopBlinking(); // Stop blinking when invincibility ends
    }
  }

  setMoving(direction) {
    this.movingDirection = direction;
  }

  updatePosition() {
    // Use transform3d for better performance
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  update(canvasWidth) {
    const newX = this.x + this.speed * this.movingDirection;
    
    // Only update if position actually changes
    if (newX !== this.x) {
      this.x = Math.max(0, Math.min(newX, canvasWidth - this.width));
      this.updatePosition();
    }
  }

  shoot(projectiles) {
    // Reset the sound to the beginning and play it
    this.shootSound.currentTime = 0; // Reset the sound to the start
    this.shootSound.play(); // Play the sound

    const projectile = new Projectile(
      this.x + this.width / 2,
      this.y,
      -10,
      true
    );
    projectiles.push(projectile);
  }
}