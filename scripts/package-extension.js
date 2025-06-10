const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputDir, 'extension.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Extension packaged successfully!');
  console.log('Total bytes:', archive.pointer());
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add extension files to the archive
const extensionDir = path.join(process.cwd(), 'extension');
archive.directory(extensionDir, false);

// Finalize the archive
archive.finalize();
