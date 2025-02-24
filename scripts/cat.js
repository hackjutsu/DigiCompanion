class PixelCat {
  constructor() {
    this.isEnabled = true;
    this.createCatElement();
    this.initializeEventListeners();
    this.lastActivity = Date.now();
    this.currentState = 'idle';
    this.infoState = 0;
    this.messageTimeout = null;
  }

  // Create template function for ASCII art
  getCatTemplate(text = '') {
    // Right-align all content
    const catArt = [
      '  /\\_/\\  ',
      ' ( o.o ) ',
      '  > ^ <  '
    ];
    
    if (text) {
      // For single line messages, show next to the cat
      if (!text.includes('\n')) {
        return `<pre>${text}\n\n ${catArt.join('\n')}</pre>`;
      }
      // For multi-line messages (like IP info), show above the cat
      return `<pre>${text}\n\n${catArt.join('\n')}</pre>`;
    }
    
    return `<pre>${catArt.join('\n')}</pre>`;
  }

  createCatElement() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'pixel-cat-container';

    // Create cat element with ASCII art
    this.catElement = document.createElement('div');
    this.catElement.className = 'pixel-cat';
    this.catElement.innerHTML = this.getCatTemplate();

    // Append elements
    this.container.appendChild(this.catElement);
    document.body.appendChild(this.container);
  }

  initializeEventListeners() {
    // Scroll event
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isEnabled) return;
      
      this.setState('thinking');
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        this.setState('idle');
      }, 1000);
    });

    // Click event
    this.catElement.addEventListener('click', async () => {
      if (!this.isEnabled) return;
      
      this.catElement.classList.add('waving');
      
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      
      try {
        // Cycle through different info
        if (!this.infoState) this.infoState = 0;
        
        switch(this.infoState % 8) {
          case 0:
            // Show IP
            this.catElement.innerHTML = this.getCatTemplate('Loading IP...');
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.catElement.innerHTML = this.getCatTemplate(`IP: ${data.ip}`);
            break;
          case 1:
            // Show time
            this.catElement.innerHTML = this.getCatTemplate(`Time: ${new Date().toLocaleTimeString()}`);
            break;
          case 2:
            // Show resolution
            this.catElement.innerHTML = this.getCatTemplate(`Screen: ${window.screen.width}x${window.screen.height}`);
            break;
          case 3:
            // Show platform
            this.catElement.innerHTML = this.getCatTemplate(`Platform: ${navigator.platform}`);
            break;
          case 4:
            // Show language
            this.catElement.innerHTML = this.getCatTemplate(`Language: ${navigator.language}`);
            break;
          case 5:
            // Show battery
            if (navigator.getBattery) {
              const battery = await navigator.getBattery();
              const level = Math.round(battery.level * 100);
              this.catElement.innerHTML = this.getCatTemplate(`Battery: ${level}%`);
            }
            break;
          case 6:
            // Show network
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
              this.catElement.innerHTML = this.getCatTemplate(`Network: ${connection.effectiveType}`);
            }
            break;
          case 7:
            // Show memory
            if (performance.memory) {
              const usedMemory = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
              this.catElement.innerHTML = this.getCatTemplate(`Memory: ${usedMemory}MB`);
            }
            break;
        }
        
        this.infoState++;
      } catch (error) {
        this.catElement.innerHTML = this.getCatTemplate('Error getting info 😢');
      }
      
      this.messageTimeout = setTimeout(() => {
        this.catElement.classList.remove('waving');
        this.catElement.innerHTML = this.getCatTemplate();
      }, 5000);
    });

    // Idle detection
    setInterval(() => {
      if (!this.isEnabled) return;
      const idleTime = Date.now() - this.lastActivity;
      if (idleTime > 30000 && this.currentState !== 'sleeping') { // 30 seconds
        this.setState('sleeping');
      }
    }, 1000);

    // Activity detection
    ['mousemove', 'keypress', 'click'].forEach(event => {
      window.addEventListener(event, () => {
        this.lastActivity = Date.now();
        if (this.currentState === 'sleeping') {
          this.setState('idle');
        }
      });
    });
  }

  setState(state) {
    this.currentState = state;
    
    // Remove all animation classes first
    this.catElement.classList.remove('thinking', 'sleeping', 'waving');
    
    // Add the new animation class
    if (state !== 'idle') {
        this.catElement.classList.add(state);
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.container.style.display = this.isEnabled ? 'block' : 'none';
  }
}

// Initialize the cat
const pixelCat = new PixelCat();

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    pixelCat.toggle();
  } else if (request.action === 'getState') {
    sendResponse({ isEnabled: pixelCat.isEnabled });
  }
});
