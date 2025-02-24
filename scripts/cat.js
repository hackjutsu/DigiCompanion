class PixelCat {
  constructor() {
    this.isEnabled = true;
    this.createCatElement();
    this.initializeEventListeners();
    this.lastActivity = Date.now();
    this.currentState = 'idle';
    this.infoState = 0;
    this.messageTimeout = null;
    this.currentPosition = 'bottom-right'; // Default position
  }

  // Create template function for ASCII art
  getCatTemplate(text = '') {
    // Define cat art with consistent spacing
    const catArt = [
      '/\\_/\\',
      '(o.o)',
      '> ^ <'
    ];
    
    // Add padding based on alignment
    const isLeftAligned = this.catElement?.style.textAlign === 'left';
    const padding = isLeftAligned ? '  ' : '  '; // Same padding for both sides
    const paddedCat = catArt.map(line => isLeftAligned ? line + padding : padding + line);
    
    if (text) {
      // Add consistent padding to text
      const paddedText = isLeftAligned ? text + padding : padding + text;
      return `<pre>${paddedText}\n\n${paddedCat.join('\n')}</pre>`;
    }
    
    return `<pre>${paddedCat.join('\n')}</pre>`;
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
        
        switch(this.infoState % 9) {
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
              // Get more detailed network info
              const type = connection.type || 'unknown';
              const downlink = connection.downlink ? `${connection.downlink} Mbps` : '';
              const info = [type, downlink].filter(Boolean).join(' ');
              this.catElement.innerHTML = this.getCatTemplate(`Network: ${info}`);
            }
            break;
          case 7:
            // Show memory
            if (performance.memory) {
              const usedMemory = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
              this.catElement.innerHTML = this.getCatTemplate(`Memory: ${usedMemory}MB`);
            }
            break;
          case 8:
            // Show device type
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            this.catElement.innerHTML = this.getCatTemplate(`Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
            break;
        }
        
        this.infoState++;
      } catch (error) {
        this.catElement.innerHTML = this.getCatTemplate('Error getting info');
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

  setPosition(position) {
    this.currentPosition = position; // Store the position
    const positions = {
      'bottom-right': { 
        bottom: '20px', 
        right: '20px', 
        top: 'auto', 
        left: 'auto',
        textAlign: 'right'
      },
      'bottom-left': { 
        bottom: '20px', 
        left: '20px', 
        top: 'auto', 
        right: 'auto',
        textAlign: 'left'
      },
      'middle-right': { 
        top: '50%', 
        right: '20px', 
        bottom: 'auto', 
        left: 'auto', 
        transform: 'translateY(-50%)',
        textAlign: 'right'
      },
      'middle-left': { 
        top: '50%', 
        left: '20px', 
        bottom: 'auto', 
        right: 'auto', 
        transform: 'translateY(-50%)',
        textAlign: 'left'
      },
      'top-right': { 
        top: '20px', 
        right: '20px', 
        bottom: 'auto', 
        left: 'auto',
        textAlign: 'right'
      },
      'top-left': { 
        top: '20px', 
        left: '20px', 
        bottom: 'auto', 
        right: 'auto',
        textAlign: 'left'
      }
    };

    const pos = positions[position];
    Object.assign(this.catElement.style, pos);
    
    // Update both the container and pre element alignment
    this.catElement.style.textAlign = pos.textAlign;
    const preElement = this.catElement.querySelector('pre');
    if (preElement) {
      preElement.style.textAlign = pos.textAlign;
    }
  }
}

// Initialize the cat
const pixelCat = new PixelCat();

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    pixelCat.toggle();
  } else if (request.action === 'getState') {
    sendResponse({ 
      isEnabled: pixelCat.isEnabled,
      position: pixelCat.currentPosition
    });
  } else if (request.action === 'setPosition') {
    pixelCat.setPosition(request.position);
  }
});
