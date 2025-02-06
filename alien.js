import { Projectile } from './projectile.js';

export class Alien {
  constructor(x, y, wave) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 1 + (wave * 0.2);
    this.direction = 1;
    
    this.element = document.createElement('div');
    this.element.className = 'game-object alien';
    this.isExploding = false;
    this.explosionFrame = 0;
    this.explosionFrameCount = 16;
    
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  update(canvasWidth) {
    if (this.isExploding) {
      this.explosionFrame++;
      return this.explosionFrame < this.explosionFrameCount;
    }

    const newX = this.x + this.speed * this.direction;
    
    if (newX <= 0 || newX + this.width >= canvasWidth) {
      this.direction *= -1;
      this.y += 20;
      this.x += this.speed * this.direction;
    } else {
      this.x = newX;
    }
    
    this.updatePosition();
    return true;
  }

  shoot(projectiles) {
    const projectile = new Projectile(
      this.x + this.width / 2,
      this.y + this.height,
      5,
      false
    );
    projectiles.push(projectile);
  }

  explode() {
    this.isExploding = true;
    this.explosionFrame = 0;
    this.element.classList.add('explosion', 'exploding');
  }
}