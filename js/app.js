// Main application initialization
window.addEventListener('load', () => {
  console.log('Chai Catcher: Desi Dash - Initializing...');
  
window.canvas = document.getElementById('gameCanvas');
const canvas = window.canvas;
  
  // Initialize game
  Game.init(canvas);
  
  // Show home screen
  UI.showHome();
  
  // Handle visibility changes for pausing
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (Game.state === 'PLAYING') {
        Game.state = 'PAUSED';
        UI.showPauseMenu();
      }
    }
  });
  
  // Handle beforeunload to prevent accidental navigation during game
  window.addEventListener('beforeunload', (e) => {
    if (Game.state === 'PLAYING' || Game.state === 'COUNTDOWN') {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
  
  // Service worker registration for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('ServiceWorker registered with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
  
  // Install prompt handling
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if available
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'block';
    }
  });
  
  // Handle app installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
});

// Export for debugging
window.ChaiCatcher = {
  Game,
  UI,
  Settings,
  Storage,
  Audio,
  Input,
  Renderer
};
