const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Move extension.zip to public directory
const source = path.join(process.cwd(), 'extension.zip');
const destination = path.join(publicDir, 'extension.zip');

try {
  if (fs.existsSync(source)) {
    fs.renameSync(source, destination);
    console.log('Extension package moved to public directory successfully!');
  } else {
    console.error('extension.zip not found. Please run npm run package-extension first.');
  }
} catch (error) {
  console.error('Error moving extension package:', error);
}
