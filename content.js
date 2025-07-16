chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    const videoId = new URL(window.location.href).searchParams.get('v');
    const videoTitle = document.title.replace(' - YouTube', '');
    const videoElement = document.querySelector('video');
    const currentTime = videoElement ? Math.floor(videoElement.currentTime) : 0;
    sendResponse({ videoId, videoTitle, currentTime });
  }
});

function showBookmarkIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #065fd4;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  indicator.textContent = 'Video Bookmarked!';
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => indicator.remove(), 500);
  }, 2000);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.bookmarks) {
    showBookmarkIndicator();
  }
}); 
