document.addEventListener('DOMContentLoaded', async () => {
  const addBookmarkBtn = document.getElementById('add-bookmark');
  const noteInput = document.getElementById('note-input');
  const videoInfo = document.getElementById('video-info');
  const bookmarksContainer = document.getElementById('bookmarks-container');


  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('youtube.com/watch')) {
    videoInfo.innerHTML = '<p>Please navigate to a YouTube video to use this extension.</p>';
    addBookmarkBtn.disabled = true;
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    { action: 'getVideoInfo' },
    (response) => {
      if (!response) {
        videoInfo.innerHTML = '<p>Could not get video info.</p>';
        addBookmarkBtn.disabled = true;
        return;
      }
      const { videoId, videoTitle, currentTime } = response;
      // Display current video info with playback time
      videoInfo.innerHTML = `
        <h3>${videoTitle}</h3>
        <p class="timestamp">Video ID: ${videoId}</p>
        <p class="timestamp">Current Time: ${formatTime(currentTime)}</p>
      `;

      loadBookmarks();

      // Add bookmark button click handler
      addBookmarkBtn.onclick = async () => {
        const note = noteInput.value.trim();
        const timestamp = new Date().toISOString();
        const bookmark = {
          videoId,
          videoTitle,
          note,
          timestamp,
          url: tab.url,
          playbackTime: currentTime
        };
        // Save bookmark to storage
        const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
        bookmarks.push(bookmark);
        await chrome.storage.local.set({ bookmarks });
        // Clear input and reload bookmarks
        noteInput.value = '';
        loadBookmarks();
      };
    }
  );
});

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function loadBookmarks() {
  const bookmarksContainer = document.getElementById('bookmarks-container');
  const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');

  if (bookmarks.length === 0) {
    bookmarksContainer.innerHTML = '<p>No bookmarks yet. Add your first bookmark!</p>';
    return;
  }

  bookmarks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  bookmarksContainer.innerHTML = bookmarks.map((bookmark, index) => `
    <div class="bookmark-item">
      <button class="delete-btn" data-index="${index}">Delete</button>
      <h3>${bookmark.videoTitle}</h3>
      <p>${bookmark.note || 'No note added'}</p>
      <p class="timestamp">Bookmarked on ${new Date(bookmark.timestamp).toLocaleString()}</p>
      <p class="timestamp">Playback Time: ${formatTime(bookmark.playbackTime)}</p>
      <a href="${bookmark.url}${bookmark.playbackTime ? `&t=${bookmark.playbackTime}s` : ''}" target="_blank">Watch Video</a>
    </div>
  `).join('');

  // Add delete button handlers
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      const { bookmarks } = await chrome.storage.local.get('bookmarks');
      bookmarks.splice(index, 1);
      await chrome.storage.local.set({ bookmarks });
      loadBookmarks();
    });
  });
} 
