const Audio = {
  context: null,
  gainNode: null,
  initialized: false,
  
  init() {
    if (this.initialized) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = Settings.get('volume');
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not available:', error);
    }
  },
  
  setVolume(volume) {
    if (!this.initialized) return;
    this.gainNode.gain.value = volume;
  },
  
  play(frequency, duration = 0.1, type = 'sine', volume = 0.3) {
    if (!Settings.get('sound') || !this.initialized) return;
    
    try {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
      
      oscillator.connect(gainNode).connect(this.gainNode);
      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  },
  
  // Predefined sound effects
  playCatch() { this.play(440, 0.1, 'sine'); },
  playCombo() { this.play(660, 0.15, 'triangle'); },
  playNegative() { this.play(110, 0.2, 'sawtooth'); },
  playPowerUp() { this.play(880, 0.2, 'square'); },
  playGameOver() { this.play(220, 0.5, 'sawtooth'); }
};