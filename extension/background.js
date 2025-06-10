// Track visited pages
let visitedPages = new Map();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      
      // Check if this is a content we want to track
      if (shouldTrackContent(url)) {
        // Store the initial visit time
        if (!visitedPages.has(tab.url)) {
          visitedPages.set(tab.url, {
            startTime: Date.now(),
            title: tab.title || url.pathname
          });
        }
        
        // Notify content script to start monitoring
        chrome.tabs.sendMessage(tabId, {
          type: 'START_MONITORING',
          url: tab.url,
          title: tab.title
        });
      }
    } catch (error) {
      console.error('Error processing tab update:', error);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTENT_PROCESSED') {
    const { url, title, summary } = message;
    
    // Store the processed content
    chrome.storage.local.get(['processedContent'], (result) => {
      const processedContent = result.processedContent || [];
      processedContent.push({
        url,
        title,
        summary,
        timestamp: Date.now()
      });
      
      // Store updated content
      chrome.storage.local.set({ processedContent }, () => {
        console.log('Content stored:', { url, title });
      });
    });
  }
});

// Helper function to check if we should track this content
function shouldTrackContent(url) {
  const trackableDomains = [
    'medium.com',
    'dev.to',
    'youtube.com',
    'github.com',
    'stackoverflow.com',
    'coursera.org',
    'udemy.com'
  ];
  
  return trackableDomains.some(domain => url.hostname.includes(domain));
}

// Clean up old entries periodically
chrome.alarms.create('cleanup', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    chrome.storage.local.get(['processedContent'], (result) => {
      if (result.processedContent) {
        const filteredContent = result.processedContent.filter(
          item => item.timestamp > oneWeekAgo
        );
        chrome.storage.local.set({ processedContent: filteredContent });
      }
    });
    
    // Clear old entries from visitedPages
    for (const [url, data] of visitedPages.entries()) {
      if (data.startTime < oneWeekAgo) {
        visitedPages.delete(url);
      }
    }
  }
});
