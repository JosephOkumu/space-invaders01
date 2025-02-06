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

}