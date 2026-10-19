const Game = {
  state: 'HOME', // HOME, MODE_SELECT, PLAYING, PAUSED, GAME_OVER, SETTINGS, HISTORY, HOW_TO_PLAY
  player: {
    x: 0,
    y: 0,
    width: 80,
    height: 20,
    dx: 0
  },
  items: [],
  powerUps: [],
  particles: [],
  score: 0,
  lives: 3,
  combo: 0,
  bestCombo: 0,
  timer: 0,
  roundTime: 60,
  startTime: 0,
  difficulty: 0.1,
  powerUpsActive: {},
  lastSpawn: 0,
  spawnRate: 1000,
  itemsCaught: 0,
  negativesCaught: 0,
  
  init(canvas) {
    Renderer.init(canvas);
    Input.init(canvas);
    this.resizePlayer();
    this.loop();
  },
  
  resizePlayer() {
    this.player.x = (canvas.clientWidth - this.player.width) / 2;
    this.player.y = canvas.clientHeight - this.player.height - 20;
  },
  
  loop() {
    const now = performance.now();
    if (!this.lastTick) this.lastTick = now;
    const dt = Math.min(now - this.lastTick, 50);
    this.lastTick = now;
    
    this.update(dt);
    this.render();
    
    requestAnimationFrame(() => this.loop());
  },
  
  update(dt) {
    if (this.state === 'PLAYING') {
      this.updatePlaying(dt);
    } else if (this.state === 'COUNTDOWN') {
      this.updateCountdown(dt);
    }
  },
  
  updateCountdown(dt) {
    this.timer -= dt / 1000;
    if (this.timer <= 0) {
      this.state = 'PLAYING';
      this.startTime = performance.now();
    }
  },
  
  updatePlaying(dt) {
    // Update timer
    this.timer = this.roundTime - (performance.now() - this.startTime) / 1000;
    if (this.timer <= 0) {
      this.endGame();
      return;
    }
    
    // Update player
    this.updatePlayer(dt);
    
    // Update items
    this.updateItems(dt);
    
    // Update power-ups
    this.updatePowerUps(dt);
    
    // Update particles
    this.updateParticles(dt);
    
    // Update difficulty
    this.updateDifficulty();
    
    // Spawn items
    this.spawnItems(dt);
  },
  
  updatePlayer(dt) {
    // Move player based on input
    if (Input.isLeft()) this.player.x -= 5;
    if (Input.isRight()) this.player.x += 5;
    
    // Touch/mouse movement
    if (this.player.dx !== 0) {
      this.player.x += this.player.dx;
      this.player.dx *= 0.8; // Friction
    }
    
    // Keep player in bounds
    const maxX = canvas.clientWidth - this.player.width;
    this.player.x = Math.max(0, Math.min(maxX, this.player.x));
  },
  
  updateItems(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      
      // Move item
      item.y += (2 + this.difficulty * 3) * (dt / 16);
      
      // Apply power-up effects
      if (this.powerUpsActive.magnet && item.score > 0) {
        const dx = this.player.x + this.player.width/2 - item.x;
        item.x += dx * 0.05;
      }
      
      if (this.powerUpsActive.slowMotion) {
        // Items already move slower due to difficulty scaling
      }
      
      // Check collision with player
      if (this.checkCollision(item, this.player)) {
        this.handleCatch(item);
        this.items.splice(i, 1);
        continue;
      }
      
      // Check if item is off-screen
      if (item.y - item.radius > canvas.clientHeight) {
        this.items.splice(i, 1);
        this.combo = 0; // Reset combo on miss
      }
    }
  },
  
  updatePowerUps(dt) {
    // Update active power-ups timers
    for (const [type, timeLeft] of Object.entries(this.powerUpsActive)) {
      this.powerUpsActive[type] -= dt;
      if (this.powerUpsActive[type] <= 0) {
        delete this.powerUpsActive[type];
      }
    }
  },
  
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.life -= dt;
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },
  
  updateDifficulty() {
    // Increase difficulty over time
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.difficulty = Math.min(0.8, 0.1 + elapsed / 60);
    this.spawnRate = Math.max(400, 1000 - this.difficulty * 600);
  },
  
  spawnItems(dt) {
    this.lastSpawn += dt;
    
    if (this.lastSpawn > this.spawnRate) {
      this.lastSpawn = 0;
      
      // Spawn positive item
      const positiveItem = Items.spawnPositive(this.difficulty);
      if (positiveItem) {
        this.items.push({
          ...positiveItem,
          x: Math.random() * (canvas.clientWidth - 2 * positiveItem.radius) + positiveItem.radius,
          y: -positiveItem.radius
        });
      }
      
      // Spawn negative item (chance increases with difficulty)
      if (Math.random() < 0.2 + this.difficulty * 0.5) {
        const negativeItem = Items.spawnNegative(this.difficulty);
        if (negativeItem) {
          this.items.push({
            ...negativeItem,
            x: Math.random() * (canvas.clientWidth - 2 * negativeItem.radius) + negativeItem.radius,
            y: -negativeItem.radius
          });
        }
      }
      
      // Spawn power-up (rare)
      if (Math.random() < 0.02) {
        const powerUp = Items.spawnPowerUp(this.difficulty);
        if (powerUp) {
          this.items.push({
            ...powerUp,
            x: Math.random() * (canvas.clientWidth - 2 * powerUp.radius) + powerUp.radius,
            y: -powerUp.radius,
            isPowerUp: true
          });
        }
      }
    }
  },
  
  checkCollision(item, player) {
    const dx = item.x - (player.x + player.width / 2);
    const dy = item.y - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < item.radius + Math.min(player.width, player.height) / 2;
  },
  
  handleCatch(item) {
    if (item.isPowerUp) {
      this.activatePowerUp(item.type);
      Audio.playPowerUp();
      return;
    }
    
    if (item.score > 0) {
      // Positive item
      let scoreGain = item.score;
      
      // Apply double score power-up
      if (this.powerUpsActive.doubleScore) {
        scoreGain *= 2;
      }
      
      // Apply combo multiplier
      const comboMultiplier = 1 + Math.floor(this.combo / 5) * 0.2;
      scoreGain = Math.floor(scoreGain * comboMultiplier);
      
      this.score += scoreGain;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.itemsCaught++;
      
      // Show floating score
      this.showFloatingScore(item.x, item.y, `+${scoreGain}`);
      
      // Create particles
      this.createParticles(item.x, item.y, item.color, 5);
      
      Audio.playCatch();
      
    } else {
      // Negative item
      this.score += item.score; // Negative score
      this.lives--;
      this.combo = 0;
      this.negativesCaught++;
      
      // Show penalty
      this.showFloatingScore(item.x, item.y, `${item.score}`, '#FF6B6B');
      
      // Create negative particles
      this.createParticles(item.x, item.y, '#FF6B6B', 8);
      
      Audio.playNegative();
      
      if (this.lives <= 0) {
        this.endGame();
      }
    }
  },
  
  activatePowerUp(type) {
    const powerUp = Items.powerUps.find(p => p.type === type);
    if (!powerUp) return;
    
    this.powerUpsActive[type] = powerUp.duration;
    
    // Visual feedback
    this.createParticles(canvas.clientWidth / 2, canvas.clientHeight / 2, powerUp.color, 15);
  },
  
  showFloatingScore(x, y, text, color = '#FFD166') {
    this.particles.push({
      x: x,
      y: y,
      text: text,
      color: color,
      life: 1000,
      vx: 0,
      vy: -2
    });
  },
  
  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        color: color,
        life: 500,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 3
      });
    }
  },
  
  startRound(time) {
    this.roundTime = time;
    this.timer = time;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.items = [];
    this.powerUps = [];
    this.particles = [];
    this.powerUpsActive = {};
    this.itemsCaught = 0;
    this.negativesCaught = 0;
    this.difficulty = 0.1;
    
    this.state = 'COUNTDOWN';
    this.lastTick = 0;
    this.lastSpawn = 0;
  },
  
  endGame() {
    this.state = 'GAME_OVER';
    this.saveHistory();
    Audio.playGameOver();
    UI.showGameOver();
  },
  
  saveHistory() {
    const record = {
      date: new Date().toISOString(),
      mode: UI.currentMode,
      roundTime: this.roundTime,
      finalScore: this.score,
      bestCombo: this.bestCombo,
      itemsCaught: this.itemsCaught,
      negativesCaught: this.negativesCaught,
      survivalTime: this.roundTime - this.timer,
      challengeResult: UI.challengeResult || null,
      version: '1.0'
    };
    
    Storage.add(record).catch(error => {
      console.error('Failed to save game history:', error);
    });
  },
  
  render() {
    Renderer.clear();
    Renderer.drawBackground(Settings.get('theme'));
    
    if (this.state === 'PLAYING' || this.state === 'COUNTDOWN') {
      // Draw items
      this.items.forEach(item => Renderer.drawItem(item));
      
      // Draw player
      Renderer.drawPlayer(this.player);
      
      // Draw particles
      this.particles.forEach(particle => {
        Renderer.ctx.save();
        Renderer.ctx.globalAlpha = Math.max(0, particle.life / 1000);
        
        if (particle.text) {
          Renderer.drawText(
            particle.text,
            particle.x,
            particle.y,
            {
              font: 'bold 16px Arial',
              color: particle.color,
              shadow: true
            }
          );
        } else {
          Renderer.ctx.fillStyle = particle.color;
          Renderer.ctx.beginPath();
          Renderer.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          Renderer.ctx.fill();
        }
        
        Renderer.ctx.restore();
      });
      
      // Draw HUD
      Renderer.drawHUD(this);
      
      // Draw countdown
      if (this.state === 'COUNTDOWN') {
        Renderer.drawText(
          `Get Ready! ${Math.ceil(this.timer)}`,
          canvas.clientWidth / 2,
          canvas.clientHeight / 2,
          {
            font: 'bold 48px Arial',
            color: '#FFD166'
          }
        );
      }
      
    } else if (this.state === 'GAME_OVER') {
      this.drawGameOver();
    }
  },
  
  drawGameOver() {
    Renderer.drawMenu(
      'Game Over',
      `Final Score: ${this.score}`,
      [
        { text: 'Play Again', action: () => UI.showModeSelect() },
        { text: 'Home', action: () => UI.showHome() },
        { text: 'History', action: () => UI.showHistory() }
      ]
    );
  }
};