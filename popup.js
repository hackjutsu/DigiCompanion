// Update state when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, (response) => {
    if (response) {
      document.getElementById('enableCat').checked = response.isEnabled;
      document.getElementById('catPosition').value = response.position;
    }
  });
});

// Toggle the cat's visibility
document.getElementById('enableCat').addEventListener('change', (e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'toggle'
    });
  });
});

// Handle position change
document.getElementById('catPosition').addEventListener('change', (e) => {
  const position = e.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'setPosition',
      position: position
    });
  });
}); 