const Renderer = {
  ctx: null,
  canvas: null,
  width: 0,
  height: 0,
  dpr: 1,
  
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },
  
  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = canvas.clientWidth * this.dpr;
    this.height = canvas.clientHeight * this.dpr;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx.scale(this.dpr, this.dpr);
  },
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },
  
  drawBackground(theme) {
    // Draw gradient background based on theme
    let gradient;
    
    switch(theme) {
      case 'monsoon':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#2F4F4F');
        gradient.addColorStop(1, '#1E3A3A');
        break;
      case 'neon':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#4B0082');
        gradient.addColorStop(1, '#1A0533');
        break;
      case 'winter':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#708090');
        gradient.addColorStop(1, '#2F4F4F');
        break;
      case 'festival':
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(1, '#FFD93D');
        break;
      default: // sunset
        gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#FF9F1C');
        gradient.addColorStop(0.5, '#FF6B6B');
        gradient.addColorStop(1, '#8B4513');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add some decorative elements
    this.drawDecorations(theme);
  },
  
  drawDecorations(theme) {
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    
    // Draw some circles for bokeh effect
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.6;
      const radius = 20 + Math.random() * 40;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fill();
    }
    
    this.ctx.restore();
  },
  
  drawPlayer(player) {
    this.ctx.save();
    
    // Player tray
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Tray border
    this.ctx.strokeStyle = '#FFD166';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // Steam effect
    if (Math.random() < 0.3) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 3; i++) {
        const steamX = player.x + 10 + i * 20 + Math.random() * 10;
        const steamY = player.y - 10 - Math.random() * 20;
        this.ctx.fillRect(steamX, steamY, 4, 8);
      }
    }
    
    this.ctx.restore();
  },
  
  drawItem(item) {
    this.ctx.save();
    
    // Item body
    this.ctx.fillStyle = item.color;
    this.ctx.beginPath();
    this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Item border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Item emoji
    this.ctx.font = `${item.radius * 1.5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(item.emoji || '📦', item.x, item.y);
    
    this.ctx.restore();
  },
  
  drawText(text, x, y, options = {}) {
    const {
      font = 'bold 24px Arial',
      color = '#FFFFFF',
      align = 'center',
      shadow = true
    } = options;
    
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    
    if (shadow) {
      this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }
    
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  },
  
  drawHUD(game) {
    // Score
    this.drawText(`Score: ${game.score}`, 20, 30, {
      font: 'bold 20px Arial',
      align: 'left',
      color: '#FFD166'
    });
    
    // Timer
    this.drawText(`Time: ${Math.ceil(game.timer)}s`, this.width - 20, 30, {
      font: 'bold 20px Arial',
      align: 'right',
      color: '#FFD166'
    });
    
    // Lives
    this.drawText(`Lives: ${game.lives}`, 20, 60, {
      font: 'bold 20px Arial',
      align: 'left',
      color: '#FF78A8'
    });
    
    // Combo
    this.drawText(`Combo: ${game.combo}`, this.width - 20, 60, {
      font: 'bold 20px Arial',
      align: 'right',
      color: '#FF78A8'
    });
  },
  
  drawMenu(title, subtitle, buttons) {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(36, 20, 61, 0.9)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Menu container
    const menuWidth = Math.min(500, this.width - 40);
    const menuHeight = Math.min(400, this.height - 40);
    const menuX = (this.width - menuWidth) / 2;
    const menuY = (this.height - menuHeight) / 2;
    
    this.ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
    this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    
    this.ctx.strokeStyle = '#FFD166';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Title
    this.drawText(title, this.width / 2, menuY + 60, {
      font: 'bold 36px Arial',
      color: '#FFD166'
    });
    
    if (subtitle) {
      this.drawText(subtitle, this.width / 2, menuY + 100, {
        font: 'italic 20px Arial',
        color: '#FFF4D6'
      });
    }
    
    // Buttons
    buttons.forEach((button, index) => {
      const buttonY = menuY + 140 + index * 60;
      this.drawButton(button.text, this.width / 2, buttonY, button.width || 200, button.height || 50);
    });
  },
  
  drawButton(text, x, y, width = 200, height = 50) {
    // Button background
    const gradient = this.ctx.createLinearGradient(x - width/2, y, x + width/2, y);
    gradient.addColorStop(0, '#FF9F1C');
    gradient.addColorStop(1, '#FFD166');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - width/2, y - height/2, width, height);
    
    // Button border
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - width/2, y - height/2, width, height);
    
    // Button text
    this.drawText(text, x, y, {
      font: 'bold 18px Arial',
      color: '#24143D',
      shadow: false
    });
  }
};