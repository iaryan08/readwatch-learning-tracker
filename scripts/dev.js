const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

console.log(`${colors.bright}Starting development environment...${colors.reset}\n`);

try {
  // Start Next.js development server
  console.log(`${colors.green}Starting Next.js development server...${colors.reset}`);
  execSync('PORT=8000 npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error(`${colors.red}Error starting development server:${colors.reset}`, error);
  process.exit(1);
}
