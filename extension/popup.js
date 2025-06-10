// DOM Elements
const statusElement = document.querySelector('.status');
const contentList = document.getElementById('content');
const viewProfileButton = document.getElementById('viewProfile');
const clearDataButton = document.getElementById('clearData');

// Update status message
function updateStatus(message) {
  statusElement.textContent = message;
}

// Create content item element
function createContentItem(item) {
  const div = document.createElement('div');
  div.className = 'content-item';
  
  div.innerHTML = `
    <div class="content-title">${item.title}</div>
    <div class="content-summary">${item.summary}</div>
    <div class="content-meta">
      <span class="content-type">${item.contentType}</span>
      <span>${new Date(item.timestamp).toLocaleDateString()}</span>
    </div>
  `;
  
  return div;
}

// Load and display content
async function loadContent() {
  try {
    // Get stored content
    const result = await chrome.storage.local.get(['processedContent']);
    const processedContent = result.processedContent || [];
    
    if (processedContent.length === 0) {
      contentList.innerHTML = `
        <div class="empty-state">
          No content processed yet. Browse some articles or videos to get started!
        </div>
      `;
      return;
    }
    
    // Clear existing content
    contentList.innerHTML = '';
    
    // Sort by timestamp (newest first)
    const sortedContent = [...processedContent].sort((a, b) => b.timestamp - a.timestamp);
    
    // Display content items
    sortedContent.forEach(item => {
      contentList.appendChild(createContentItem(item));
    });
    
    updateStatus('Ready');
  } catch (error) {
    console.error('Error loading content:', error);
    updateStatus('Error loading content');
  }
}

// Clear stored data
async function clearData() {
  try {
    await chrome.storage.local.clear();
    loadContent(); // Reload the empty state
    updateStatus('Data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    updateStatus('Error clearing data');
  }
}

// Open profile page
function openProfile() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('../index.html')
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadContent);
viewProfileButton.addEventListener('click', openProfile);
clearDataButton.addEventListener('click', clearData);

// Listen for content updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.processedContent) {
    loadContent();
  }
});
