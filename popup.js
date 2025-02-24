// Update checkbox based on the current state of the cat
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, (response) => {
    document.getElementById('enableCat').checked = response.isEnabled;
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