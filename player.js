import { Projectile } from './projectile.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 48;
    this.speed = 5;
    this.movingDirection = 0;
    
    this.element = document.createElement('div');
    this.element.className = 'game-object player';
    document.getElementById('game-area').appendChild(this.element);
    this.updatePosition();
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
    const projectile = new Projectile(
      this.x + this.width / 2,
      this.y,
      -10,
      true
    );
    projectiles.push(projectile);
  }
}