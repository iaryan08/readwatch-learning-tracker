// Import the LLM functionality
import { summarizeContent, shouldTrackContent, getContentType } from '../src/lib/llm.js';

// Track if we're already monitoring this page
let isMonitoring = false;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_MONITORING' && !isMonitoring) {
    isMonitoring = true;
    processPageContent(message.url, message.title);
  }
});

// Main function to process page content
async function processPageContent(url, title) {
  try {
    // Check if this content should be tracked
    if (!shouldTrackContent(url, title)) {
      return;
    }

    // Extract content based on content type
    const contentType = getContentType(url);
    let content = '';

    if (contentType === 'article') {
      content = extractArticleContent();
    } else if (contentType === 'video') {
      content = extractVideoContent();
    }

    if (!content) {
      console.log('No valid content found to process');
      return;
    }

    // Generate summary using local LLM
    const summaryResult = await summarizeContent(content);
    
    if (summaryResult.success) {
      // Send processed content to background script
      chrome.runtime.sendMessage({
        type: 'CONTENT_PROCESSED',
        url,
        title,
        summary: summaryResult.summary,
        contentType
      });
    } else {
      console.error('Failed to generate summary:', summaryResult.error);
    }
  } catch (error) {
    console.error('Error processing page content:', error);
  }
}

// Extract content from article pages
function extractArticleContent() {
  // Try to find the main content using common article selectors
  const selectors = [
    'article',
    '[role="article"]',
    '.article-content',
    '.post-content',
    'main',
    '#content'
  ];

  let content = '';
  
  // Try each selector until we find content
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Get text content and clean it up
      content = element.textContent
        .replace(/\\s+/g, ' ')
        .trim();
      
      if (content.length > 100) {
        break;
      }
    }
  }

  // If no content found through selectors, try getting all paragraphs
  if (!content) {
    const paragraphs = Array.from(document.getElementsByTagName('p'))
      .map(p => p.textContent.trim())
      .filter(text => text.length > 40) // Filter out short paragraphs
      .join(' ');
    
    if (paragraphs.length > 100) {
      content = paragraphs;
    }
  }

  return content;
}

// Extract content from video pages
function extractVideoContent() {
  // Handle different video platforms
  const url = window.location.href;
  
  if (url.includes('youtube.com')) {
    return extractYouTubeContent();
  } else if (url.includes('vimeo.com')) {
    return extractVimeoContent();
  }
  
  return '';
}

// Extract YouTube video information
function extractYouTubeContent() {
  const title = document.querySelector('h1.title')?.textContent || '';
  const description = document.querySelector('#description')?.textContent || '';
  return `${title}\n${description}`.trim();
}

// Extract Vimeo video information
function extractVimeoContent() {
  const title = document.querySelector('h1')?.textContent || '';
  const description = document.querySelector('.description')?.textContent || '';
  return `${title}\n${description}`.trim();
}

// Start monitoring when the script loads
const url = window.location.href;
const title = document.title;
processPageContent(url, title);
