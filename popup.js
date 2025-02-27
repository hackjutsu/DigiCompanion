// Update state when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // Check if we can send messages to this tab
  if (tabs[0].url.startsWith('chrome://')) {
    // Disable controls for chrome:// pages
    document.getElementById('enableCat').disabled = true;
    document.getElementById('catPosition').disabled = true;
    document.querySelector('.tip').textContent = 'Note: Cat is not available on Chrome settings pages';
    return;
  }

  chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, (response) => {
    if (chrome.runtime.lastError) {
      // Handle error silently
      return;
    }
    if (response) {
      document.getElementById('enableCat').checked = response.isEnabled;
      document.getElementById('catPosition').value = response.position;
    }
  });
});

// Toggle the cat's visibility
document.getElementById('enableCat').addEventListener('change', (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggle'
      });
    }
  });
});

// Handle position change
document.getElementById('catPosition').addEventListener('change', (e) => {
  const position = e.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'setPosition',
        position: position
      });
    }
  });
}); 