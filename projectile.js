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
  
    updatePosition() {
        this.element.style.transform = `translate3d(${this.x - this.width/2}px, ${this.y}px, 0)`;
      }
    
      update() {
        this.y += this.velocity;
        
        // Deactivate projectile if it goes off screen
        if (this.y < -this.height || this.y > 600) {
          this.isActive = false;
          return;
        }
        
        this.updatePosition();
      }
    }