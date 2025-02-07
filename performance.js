export class Performance {
    constructor() {
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.fps = 0;
      this.fpsElement = document.getElementById('fps');
    }
  
    measure() {
      const currentTime = performance.now();
      this.frameCount++;
  
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        if (this.fpsElement) {
          this.fpsElement.textContent = `FPS: ${this.fps}`;
        }
      }
  
      return this.fps;
    }
  }