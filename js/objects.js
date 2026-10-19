const Items = {
  positive: [
    { type: 'chai', score: 10, color: '#8B4513', radius: 15, weight: 30, emoji: '🍵' },
    { type: 'samosa', score: 15, color: '#D2691E', radius: 14, weight: 25, emoji: '🥟' },
    { type: 'biscuit', score: 5, color: '#DEB887', radius: 12, weight: 40, emoji: '🍪' },
    { type: 'jalebi', score: 20, color: '#FF4500', radius: 13, weight: 15, emoji: '🌀' },
    { type: 'pakora', score: 25, color: '#B8860B', radius: 16, weight: 10, emoji: '🍟' },
    { type: 'goldenChai', score: 30, color: '#FFD700', radius: 14, weight: 5, emoji: '✨🍵' }
  ],
  
  negative: [
    { type: 'rubbish', penalty: -10, color: '#696969', radius: 13, weight: 20, emoji: '🗑️' },
    { type: 'slipper', penalty: -15, color: '#8B4513', radius: 14, weight: 15, emoji: '🩴' },
    { type: 'rotten', penalty: -20, color: '#556B2F', radius: 13, weight: 10, emoji: '🗑️' },
    { type: 'brokenCup', penalty: -10, color: '#A9A9A9', radius: 12, weight: 15, emoji: 'roken' }
  ],
  
  powerUps: [
    { type: 'shield', duration: 5000, color: '#00BFFF', radius: 12, weight: 5, emoji: '🛡️' },
    { type: 'magnet', duration: 8000, color: '#FFD700', radius: 12, weight: 4, emoji: '🧲' },
    { type: 'slowMotion', duration: 6000, color: '#9370DB', radius: 12, weight: 3, emoji: '⏳' },
    { type: 'doubleScore', duration: 10000, color: '#FF69B4', radius: 12, weight: 2, emoji: '2️⃣' }
  ],
  
  getWeightedItem(pool, difficulty) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let item of pool) {
      random -= item.weight;
      if (random <= 0) {
        return { ...item };
      }
    }
    
    return pool[0];
  },
  
  spawnPositive(difficulty) {
    return this.getWeightedItem(this.positive, difficulty);
  },
  
  spawnNegative(difficulty) {
    // Increase negative spawn chance with difficulty
    if (Math.random() < 0.3 + difficulty * 0.4) {
      return this.getWeightedItem(this.negative, difficulty);
    }
    return null;
  },
  
  spawnPowerUp(difficulty) {
    if (Math.random() < 0.05 + difficulty * 0.05) {
      return this.getWeightedItem(this.powerUps, difficulty);
    }
    return null;
  }
};