class PixelDino {
  constructor() {
    this.isEnabled = true;
    this.createDinoElement();
    this.initializeEventListeners();
    this.lastActivity = Date.now();
    this.currentState = 'idle';
  }

  createDinoElement() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'pixel-dino-container';

    // Create dino element
    this.dinoElement = document.createElement('img');
    this.dinoElement.className = 'pixel-dino';
    this.dinoElement.src = chrome.runtime.getURL('images/dino-idle.png');
    this.dinoElement.alt = 'Pixel Dinosaur';

    // Create speech bubble
    this.speechBubble = document.createElement('div');
    this.speechBubble.className = 'dino-speech-bubble';

    // Append elements
    this.container.appendChild(this.dinoElement);
    this.container.appendChild(this.speechBubble);
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
    this.dinoElement.addEventListener('click', () => {
      if (!this.isEnabled) return;
      this.showMessage('Hi there! 👋');
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
    const stateImages = {
      idle: 'dino-idle.png',
      thinking: 'dino-thinking.png',
      sleeping: 'dino-sleeping.png'
    };
    
    this.dinoElement.src = chrome.runtime.getURL(`images/${stateImages[state]}`);
  }

  showMessage(text, duration = 3000) {
    this.speechBubble.textContent = text;
    this.speechBubble.style.display = 'block';
    
    setTimeout(() => {
      this.speechBubble.style.display = 'none';
    }, duration);
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.container.style.display = this.isEnabled ? 'block' : 'none';
  }
}

// Initialize the dinosaur
const pixelDino = new PixelDino();

// Listen for toggle messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    pixelDino.toggle();
  }
}); 