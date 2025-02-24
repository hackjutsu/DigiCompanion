class PixelCat {
  constructor() {
    this.isEnabled = true;
    this.createCatElement();
    this.initializeEventListeners();
    this.lastActivity = Date.now();
    this.currentState = 'idle';
  }

  createCatElement() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'pixel-cat-container';

    // Create cat element with ASCII art
    this.catElement = document.createElement('div');
    this.catElement.className = 'pixel-cat';
    this.catElement.innerHTML =
`<pre>
 /\\_/\\  
( o.o ) 
 > ^ <
</pre>`;

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
    this.catElement.addEventListener('click', () => {
      if (!this.isEnabled) return;
      
      // Add waving animation
      this.catElement.classList.add('waving');
      
      // Remove waving class after animation completes
      setTimeout(() => {
        this.catElement.classList.remove('waving');
      }, 500); // Match the animation duration
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