document.getElementById('enableDino').addEventListener('change', (e) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'toggle'
    });
  });
}); 