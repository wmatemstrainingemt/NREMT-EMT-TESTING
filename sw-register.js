// Service Worker Registration Script

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('A new version of the NREMT Testing System is available. Would you like to update?')) {
                newWorker.postMessage('SKIP_WAITING');
                window.location.reload();
              }
            }
          });
        });
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 3600000); // Check every hour
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
      
    // Handle online/offline status
    window.addEventListener('online', () => {
      console.log('Connection restored. System is online.');
      updateOnlineStatus(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('Connection lost. System is offline.');
      updateOnlineStatus(false);
    });
    
    // Initial status check
    updateOnlineStatus(navigator.onLine);
  });
}

function updateOnlineStatus(isOnline) {
  const statusElement = document.getElementById('connection-status');
  if (statusElement) {
    statusElement.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
    statusElement.className = isOnline ? 'online' : 'offline';
  }
  
  // Show notification for offline mode
  if (!isOnline) {
    showOfflineNotification();
  }
}

function showOfflineNotification() {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('offline-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #d69e2e;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-weight: 600;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = '⚠️ You are currently offline. All features will continue to work.';
  notification.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Export functions for use in main application
window.NREMTOffline = {
  isOnline: () => navigator.onLine,
  registerSW: () => {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register('/service-worker.js');
    }
    return Promise.reject('Service Workers not supported');
  },
  updateContent: () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage('UPDATE_CONTENT');
    }
  }
};