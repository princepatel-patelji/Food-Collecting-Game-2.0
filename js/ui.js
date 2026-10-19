const UI = {
  overlay: document.getElementById('ui-overlay'),
  currentMode: 'Classic',
  challengeTarget: 0,
  challengeCurrent: 0,
  challengeResult: null,
  
  showHome() {
    this.overlay.innerHTML = `
      <div class="menu">
        <svg width="120" height="120" style="margin-bottom:1rem;">
          <use href="#chai-logo" />
        </svg>
        <h1>CHAI CATCHER</h1>
        <p style="font-style:italic; margin-bottom:1.5rem;">Catch the Chai. Dodge the Chaos!</p>
        <button id="playBtn" style="font-size:1.2rem; padding:1rem 2rem;">Play</button>
        <button id="modeBtn">Select Mode</button>
        <button id="historyBtn">Game History</button>
        <button id="settingsBtn">Settings</button>
        <button id="howtoBtn">How to Play</button>
        <div style="margin-top:1.5rem; font-size:0.9rem; color:var(--cream);">
          <p>Best Score: ${this.getBestScore()}</p>
        </div>
        <div class="credit">Created by Prince Patel</div>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    
    document.getElementById('playBtn').onclick = () => this.showModeSelect();
    document.getElementById('modeBtn').onclick = () => this.showModeSelect();
    document.getElementById('historyBtn').onclick = () => this.showHistory();
    document.getElementById('settingsBtn').onclick = () => this.showSettings();
    document.getElementById('howtoBtn').onclick = () => this.showHowTo();
  },
  
  getBestScore() {
    // This would typically come from storage
    return localStorage.getItem('bestScore') || 0;
  },
  
  showModeSelect() {
    this.overlay.innerHTML = `
      <div class="menu">
        <h2>Select Game Mode</h2>
        <button id="classic">Classic Chai<br><small>60 seconds, 3 lives</small></button>
        <button id="endless">Endless Tapri<br><small>Survive as long as possible</small></button>
        <button id="challenge">Challenge Mode<br><small>Catch 20 items in 45 seconds</small></button>
        <button id="back">Back to Home</button>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    
    document.getElementById('classic').onclick = () => {
      this.currentMode = 'Classic';
      this.startGame(60);
    };
    
    document.getElementById('endless').onclick = () => {
      this.currentMode = 'Endless';
      this.startGame(0); // 0 = endless
    };
    
    document.getElementById('challenge').onclick = () => {
      this.currentMode = 'Challenge';
      this.startChallenge();
    };
    
    document.getElementById('back').onclick = () => this.showHome();
  },
  
  startGame(time) {
    Game.startRound(time);
    this.overlay.classList.add('hidden');
    this.showHUD();
  },
  
  startChallenge() {
    this.challengeTarget = 20;
    this.challengeCurrent = 0;
    this.challengeResult = null;
    Game.startRound(45);
    this.overlay.classList.add('hidden');
    this.showHUD();
  },
  
  showHUD() {
    this.overlay.innerHTML = `
      <div id="hud">
        <div>Score: <span id="score">0</span></div>
        <div>Time: <span id="timer">60</span>s</div>
        <div>Lives: <span id="lives">3</span> ❤️❤️❤️</div>
        <div>Combo: <span id="combo">0</span></div>
        ${this.currentMode === 'Challenge' ? 
          `<div>Challenge: <span id="challenge">${this.challengeCurrent}/${this.challengeTarget}</span></div>` : 
          ''}
        <button id="pauseBtn">⏸️</button>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    
    document.getElementById('pauseBtn').onclick = () => {
      if (Game.state === 'PLAYING') {
        Game.state = 'PAUSED';
        this.showPauseMenu();
      } else if (Game.state === 'PAUSED') {
        Game.state = 'PLAYING';
        this.hidePauseMenu();
      }
    };
    
    this.updateHUD();
  },
  
  showPauseMenu() {
    const pauseMenu = document.createElement('div');
    pauseMenu.style.cssText = `
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background:rgba(36,20,61,0.95);
      padding:2rem;
      border-radius:15px;
      border:2px solid var(--gold);
      z-index:20;
      text-align:center;
    `;
    
    pauseMenu.innerHTML = `
      <h2>Game Paused</h2>
      <button id="resumeBtn">Resume</button>
      <button id="restartBtn">Restart</button>
      <button id="menuBtn">Main Menu</button>
    `;
    
    this.overlay.appendChild(pauseMenu);
    
    document.getElementById('resumeBtn').onclick = () => {
      Game.state = 'PLAYING';
      this.overlay.removeChild(pauseMenu);
    };
    
    document.getElementById('restartBtn').onclick = () => {
      this.overlay.removeChild(pauseMenu);
      this.startGame(Game.roundTime);
    };
    
    document.getElementById('menuBtn').onclick = () => {
      this.overlay.removeChild(pauseMenu);
      this.showHome();
    };
  },
  
  hidePauseMenu() {
    const pauseMenu = this.overlay.querySelector('div[style*="position:absolute"]');
    if (pauseMenu) {
      this.overlay.removeChild(pauseMenu);
    }
  },
  
  updateHUD() {
    const update = () => {
      const scoreEl = document.getElementById('score');
      const timerEl = document.getElementById('timer');
      const livesEl = document.getElementById('lives');
      const comboEl = document.getElementById('combo');
      const challengeEl = document.getElementById('challenge');
      
      if (scoreEl) scoreEl.textContent = Game.score;
      if (timerEl) timerEl.textContent = Math.ceil(Game.timer);
      if (livesEl) livesEl.textContent = Game.lives;
      if (comboEl) comboEl.textContent = Game.combo;
      if (challengeEl && this.currentMode === 'Challenge') {
        challengeEl.textContent = `${this.challengeCurrent}/${this.challengeTarget}`;
      }
      
      if (Game.state === 'PLAYING' || Game.state === 'PAUSED' || Game.state === 'COUNTDOWN') {
        requestAnimationFrame(update);
      }
    };
    
    update();
  },
  
  showGameOver() {
    const isChallenge = this.currentMode === 'Challenge';
    const challengeSuccess = isChallenge && this.challengeCurrent >= this.challengeTarget;
    
    this.challengeResult = challengeSuccess ? 'Success' : 'Failed';
    
    this.overlay.innerHTML = `
      <div class="menu">
        <h2 style="color:${challengeSuccess ? '#FFD166' : '#FF6B6B'}">
          ${challengeSuccess ? 'Challenge Complete!' : 'Game Over'}
        </h2>
        <p>Final Score: <strong style="color:var(--gold);font-size:1.5rem;">${Game.score}</strong></p>
        <p>Best Combo: ${Game.bestCombo}</p>
        <p>Items Caught: ${Game.itemsCaught}</p>
        <p>Negative Items: ${Game.negativesCaught}</p>
        ${isChallenge ? `<p>Challenge: ${this.challengeCurrent}/${this.challengeTarget} - ${this.challengeResult}</p>` : ''}
        ${Game.score > this.getBestScore() ? '<p style="color:var(--gold);">🎉 New Personal Best!</p>' : ''}
        
        <button id="playAgain" style="margin-top:1rem;">Play Again</button>
        <button id="homeBtn">Home</button>
        <button id="historyBtn">View History</button>
        <button id="shareBtn">Share Result</button>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    
    // Update personal best
    if (Game.score > this.getBestScore()) {
      localStorage.setItem('bestScore', Game.score);
    }
    
    document.getElementById('playAgain').onclick = () => this.showModeSelect();
    document.getElementById('homeBtn').onclick = () => this.showHome();
    document.getElementById('historyBtn').onclick = () => this.showHistory();
    document.getElementById('shareBtn').onclick = () => this.shareResult();
  },
  
  showHistory() {
    Storage.getAll().then(history => {
      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const recentGames = history.slice(0, 10);
      const totalGames = history.length;
      const totalScore = history.reduce((sum, game) => sum + game.finalScore, 0);
      const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
      const bestScore = history.reduce((max, game) => Math.max(max, game.finalScore), 0);
      
      this.overlay.innerHTML = `
        <div class="menu" style="max-width:90vw; max-height:80vh; overflow-y:auto;">
          <h2>Game History</h2>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:1rem; margin:1rem 0;">
            <div style="background:rgba(255,209,102,0.1); padding:1rem; border-radius:8px;">
              <h3 style="color:var(--gold);">Total Games</h3>
              <p style="font-size:2rem; margin:0;">${totalGames}</p>
            </div>
            <div style="background:rgba(255,120,168,0.1); padding:1rem; border-radius:8px;">
              <h3 style="color:var(--pink);">Average Score</h3>
              <p style="font-size:2rem; margin:0;">${avgScore}</p>
            </div>
            <div style="background:rgba(255,159,28,0.1); padding:1rem; border-radius:8px;">
              <h3 style="color:var(--saffron);">Best Score</h3>
              <p style="font-size:2rem; margin:0;">${bestScore}</p>
            </div>
          </div>
          
          ${recentGames.length > 0 ? `
            <h3 style="margin-top:1.5rem;">Recent Games</h3>
            <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
              <thead>
                <tr style="border-bottom:2px solid var(--gold);">
                  <th style="padding:0.5rem; text-align:left;">Date</th>
                  <th style="padding:0.5rem; text-align:center;">Mode</th>
                  <th style="padding:0.5rem; text-align:right;">Score</th>
                  <th style="padding:0.5rem; text-align:center;">Combo</th>
                </tr>
              </thead>
              <tbody>
                ${recentGames.map(game => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <td style="padding:0.5rem; font-size:0.9rem;">
                      ${new Date(game.date).toLocaleDateString()} ${new Date(game.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td style="padding:0.5rem; text-align:center; font-size:0.9rem;">${game.mode}</td>
                    <td style="padding:0.5rem; text-align:right; color:var(--gold);">${game.finalScore}</td>
                    <td style="padding:0.5rem; text-align:center; color:var(--pink);">${game.bestCombo}x</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No games played yet. Play a round to see your history!</p>'}
          
          <div style="margin-top:1.5rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button id="exportHist">Export JSON</button>
            <button id="clearHist" style="background:linear-gradient(135deg,#FF6B6B,#FF8E8E);">Clear History</button>
            <button id="backBtn">Back to Home</button>
          </div>
        </div>
      `;
      
      this.overlay.classList.remove('hidden');
      
      document.getElementById('exportHist').onclick = () => this.exportHistory(history);
      document.getElementById('clearHist').onclick = () => this.clearHistory();
      document.getElementById('backBtn').onclick = () => this.showHome();
      
    }).catch(error => {
      console.error('Error loading history:', error);
      this.overlay.innerHTML = `
        <div class="menu">
          <h2>Error Loading History</h2>
          <p>Unable to load game history.</p>
          <button id="backBtn2">Back to Home</button>
        </div>
      `;
      this.overlay.classList.remove('hidden');
      document.getElementById('backBtn2').onclick = () => this.showHome();
    });
  },
  
  exportHistory(history) {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chai-catcher-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  clearHistory() {
    if (confirm('Are you sure you want to clear all game history? This cannot be undone.')) {
      Storage.clear().then(() => {
        localStorage.removeItem('bestScore');
        this.showHistory(); // Refresh the history page
      }).catch(error => {
        console.error('Error clearing history:', error);
        alert('Failed to clear history. Please try again.');
      });
    }
  },
  
  showSettings() {
    const settings = Settings;
    
    this.overlay.innerHTML = `
      <div class="menu" style="max-width:90vw; max-height:80vh; overflow-y:auto;">
        <h2>Settings</h2>
        
        <div style="margin:1rem 0;">
          <label style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="soundToggle" ${settings.get('sound') ? 'checked' : ''}>
            Sound Effects
          </label>
        </div>
        
        <div style="margin:1rem 0;">
          <label style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="musicToggle" ${settings.get('music') ? 'checked' : ''}>
            Background Music
          </label>
        </div>
        
        <div style="margin:1rem 0;">
          <label>Volume: <span id="volumeValue">${Math.round(settings.get('volume') * 100)}%</span></label>
          <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="${settings.get('volume')}" style="width:200px;">
        </div>
        
        <div style="margin:1rem 0;">
          <label>Round Duration: <span id="timeValue">${settings.get('roundTime')}s</span></label>
          <input type="range" id="timeSlider" min="30" max="120" step="30" value="${settings.get('roundTime')}" style="width:200px;">
        </div>
        
        <div style="margin:1rem 0;">
          <label>Difficulty: <span id="diffValue">${settings.get('difficulty')}</span></label>
          <select id="diffSelect" style="padding:0.5rem; border-radius:5px;">
            <option value="easy">Easy</option>
            <option value="normal" ${settings.get('difficulty') === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div style="margin:1rem 0;">
          <label>Theme: <span id="themeValue">${settings.get('theme')}</span></label>
          <select id="themeSelect" style="padding:0.5rem; border-radius:5px;">
            <option value="sunset">Sunset Chai Stall</option>
            <option value="monsoon">Monsoon Street</option>
            <option value="neon">Neon Night Market</option>
            <option value="winter">Winter Chai Corner</option>
            <option value="festival">Festival Food Lane</option>
          </select>
        </div>
        
        <div style="margin:1rem 0;">
          <label style="display:flex; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="reducedMotion" ${settings.get('reducedMotion') ? 'checked' : ''}>
            Reduced Motion
          </label>
        </div>
        
        <div style="margin-top:1.5rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button id="saveSettings">Save Settings</button>
          <button id="resetSettings">Reset to Default</button>
          <button id="backSettings">Back</button>
        </div>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    
    // Event listeners
    document.getElementById('soundToggle').addEventListener('change', (e) => {
      settings.set('sound', e.target.checked);
    });
    
    document.getElementById('musicToggle').addEventListener('change', (e) => {
      settings.set('music', e.target.checked);
    });
    
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
      const volume = parseFloat(e.target.value);
      document.getElementById('volumeValue').textContent = `${Math.round(volume * 100)}%`;
      settings.set('volume', volume);
      Audio.setVolume(volume);
    });
    
    document.getElementById('timeSlider').addEventListener('input', (e) => {
      const time = parseInt(e.target.value);
      document.getElementById('timeValue').textContent = `${time}s`;
      settings.set('roundTime', time);
    });
    
    document.getElementById('diffSelect').addEventListener('change', (e) => {
      document.getElementById('diffValue').textContent = e.target.value;
      settings.set('difficulty', e.target.value);
    });
    
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      document.getElementById('themeValue').textContent = e.target.value;
      settings.set('theme', e.target.value);
    });
    
    document.getElementById('reducedMotion').addEventListener('change', (e) => {
      settings.set('reducedMotion', e.target.checked);
    });
    
    document.getElementById('saveSettings').onclick = () => {
      alert('Settings saved!');
      this.showHome();
    };
    
    document.getElementById('resetSettings').onclick = () => {
      if (confirm('Reset all settings to default?')) {
        Object.assign(Settings, Settings.defaults);
        Settings.save();
        this.showSettings(); // Refresh
      }
    };
    
    document.getElementById('backSettings').onclick = () => this.showHome();
  },
  
  showHowTo() {
    this.overlay.innerHTML = `
      <div class="menu" style="max-width:90vw; max-height:80vh; overflow-y:auto;">
        <h2>How to Play</h2>
        
        <div style="text-align:left; margin:1rem 0;">
          <h3 style="color:var(--gold); margin-bottom:0.5rem;">🎯 Objective</h3>
          <p>Catch delicious Indian street food items while avoiding rubbish and obstacles. Build combos and achieve the highest score!</p>
          
          <h3 style="color:var(--gold); margin:1.5rem 0 0.5rem;">🎮 Controls</h3>
          <p><strong>Desktop:</strong> Use ← → arrow keys or A/D to move the tray.</p>
          <p><strong>Mobile:</strong> Drag the tray left or right with your finger.</p>
          <p><strong>Pause:</strong> Press Spacebar or tap the pause button.</p>
          
          <h3 style="color:var(--gold); margin:1.5rem 0 0.5rem;">📦 Items</h3>
          <p><strong style="color:var(--gold);">Positive Items:</strong> Chai, Samosa, Biscuits, Jalebi, etc. Catch them for points!</p>
          <p><strong style="color:#FF6B6B;">Negative Items:</strong> Rubbish, broken cups, etc. Avoid them to keep your lives!</p>
          
          <h3 style="color:var(--gold); margin:1.5rem 0 0.5rem;">⚡ Combo System</h3>
          <p>Chain consecutive catches to build your combo multiplier:</p>
          <ul style="margin-left:1.5rem;">
            <li>5x combo: +20% score bonus</li>
            <li>10x combo: +50% score bonus</li>
            <li>15x combo: +100% score bonus</li>
            <li>25x combo: +150% score bonus</li>
          </ul>
          
          <h3 style="color:var(--gold); margin:1.5rem 0 0.5rem;">❤️ Lives</h3>
          <p>You start with 3 lives. Catching negative items reduces your lives. If you lose all lives, the game ends.</p>
          
          <h3 style="color:var(--gold); margin:1.5rem 0 0.5rem;">🛡️ Power-ups</h3>
          <p>Occasionally, special items will appear:</p>
          <ul style="margin-left:1.5rem;">
            <li><strong>Shield:</strong> Protects from one negative item</li>
            <li><strong>Magnet:</strong> Attracts nearby food items</li>
            <li><strong>Slow Motion:</strong> Slows down falling items</li>
            <li><strong>Double Score:</strong> Doubles points for a limited time</li>
          </ul>
        </div>
        
        <button id="backHowTo" style="margin-top:1rem;">Back to Home</button>
      </div>
    `;
    
    this.overlay.classList.remove('hidden');
    document.getElementById('backHowTo').onclick = () => this.showHome();
  },
  
  shareResult() {
    const shareText = `I scored ${Game.score} in Chai Catcher: Desi Dash! Can you beat my score? — Prince Patel`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Chai Catcher: Desi Dash',
        text: shareText,
        url: window.location.href
      }).catch(error => {
        console.log('Error sharing:', error);
        this.fallbackShare(shareText);
      });
    } else {
      this.fallbackShare(shareText);
    }
  },
  
  fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Score copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Score copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    });
  }
};