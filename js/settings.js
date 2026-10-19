const Settings = {
  defaults: {
    sound: true,
    music: false,
    volume: 0.5,
    effects: 'medium',
    reducedMotion: false,
    control: 'touch',
    roundTime: 60,
    difficulty: 'normal',
    theme: 'sunset'
  },
  
  load() {
    try {
      const saved = localStorage.getItem('chaiSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(this, parsed);
      } else {
        Object.assign(this, this.defaults);
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults');
      Object.assign(this, this.defaults);
    }
    return this;
  },
  
  save() {
    try {
      localStorage.setItem('chaiSettings', JSON.stringify(this));
    } catch (error) {
      console.warn('Failed to save settings');
    }
  },
  
  get(key) {
    return this[key];
  },
  
  set(key, value) {
    this[key] = value;
    this.save();
  }
};

// Initialize settings
Settings.load();