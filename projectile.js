export class Projectile {
    constructor(x, y, velocity, isPlayerProjectile = true) {
      this.x = x;
      this.y = y;
      this.width = 8;
      this.height = 16;
      this.velocity = velocity;
      this.isActive = true;
      
      this.element = document.createElement('div');
      this.element.className = `projectile ${isPlayerProjectile ? 'player-projectile' : 'alien-projectile'}`;
      document.getElementById('game-area').appendChild(this.element);
      this.updatePosition();
    }
  
}