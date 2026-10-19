const Input = {
  keys: {},
  touchStartX: 0,
  dragging: false,
  canvas: null,
  
  init(canvas) {
    this.canvas = canvas;
    this.setupKeyboard();
    this.setupTouch();
    this.setupResize();
  },
  
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      // Prevent default for game keys
      if (['ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  },
  
  setupTouch() {
    // Prevent default touch behaviors on game canvas
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.dragging = true;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.dragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - this.touchStartX;
        Game.player.dx = dx * 0.5;
        this.touchStartX = touch.clientX;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.dragging = false;
      Game.player.dx = 0;
    }, { passive: false });
    
    canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.dragging = false;
      Game.player.dx = 0;
    }, { passive: false });
    
    // Mouse support for desktop testing
    canvas.addEventListener('mousedown', (e) => {
      this.touchStartX = e.clientX;
      this.dragging = true;
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.touchStartX;
      Game.player.dx = dx * 0.5;
      this.touchStartX = e.clientX;
    });
    
    window.addEventListener('mouseup', () => {
      this.dragging = false;
      Game.player.dx = 0;
    });
  },
  
  setupResize() {
    window.addEventListener('resize', () => {
      // Reset player position on resize to keep it in bounds
      if (Game.player) {
        Game.player.x = Math.min(Game.player.x, canvas.clientWidth - Game.player.width);
      }
    });
  },
  
  isLeft() {
    return this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
  },
  
  isRight() {
    return this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
  },
  
  isPause() {
    return this.keys[' '] || this.keys['Escape'];
  }
};