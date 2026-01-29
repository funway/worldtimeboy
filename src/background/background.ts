// Background script for auto-reload during development
chrome.runtime.onInstalled.addListener(() => {
  console.log('WorldTimeBoy extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === 'reload') {
    chrome.runtime.reload();
  }
  return true;
});
