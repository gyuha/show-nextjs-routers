const path = require('path');
const fs = require('fs');
const { analyzeRoutes } = require('./router-analyzer');

/**
 * Find Next.js app directory
 * @param {string} startDir - Starting directory
 * @return {string|null} App directory path or null
 */
function findAppDirectory(startDir) {
  // Look for 'src/app' in the current directory
  const srcAppPath = path.join(startDir, 'src', 'app');
  if (fs.existsSync(srcAppPath) && fs.statSync(srcAppPath).isDirectory()) {
    return srcAppPath;
  }

  // Look for 'app' in the current directory
  const appPath = path.join(startDir, 'app');
  if (fs.existsSync(appPath) && fs.statSync(appPath).isDirectory()) {
    return appPath;
  }

  return null;
}

/**
 * Parse CLI options
 * @param {Array} args - Command line arguments
 * @return {Object} Parsed options
 */
function parseOptions(args) {
  const options = {
    treeMode: false,
    host: 'http://localhost:3000',
    appDir: null,
    slugs: {}, // slug 값을 저장할 객체 추가
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-t' || arg === '--tree') {
      options.treeMode = true;
    } else if (arg === '-h' || arg === '--host') {
      if (i + 1 < args.length) {
        options.host = args[i + 1];
        i++;
      }
    } else if (arg === '-d' || arg === '--dir') {
      if (i + 1 < args.length) {
        options.appDir = args[i + 1];
        i++;
      }
    } else if (arg === '-s' || arg === '--slug') {
      if (i + 1 < args.length) {
        const slugArg = args[i + 1];
        const [key, value] = slugArg.split('=');
        if (key && value) {
          options.slugs[key] = value;
        }
        i++;
      }
    }
  }

  return options;
}

/**
 * Display CLI help
 */
function showHelp() {
  console.log(`
  Usage: npx show-nextjs-routers [options]
  
  Options:
    -t, --tree            Display route structure in tree format
    -h, --host <url>      Set base host URL (default: http://localhost:3000)
    -d, --dir <path>      Directly specify Next.js app directory
    -s, --slug <key=value> Replace dynamic route segments (e.g., slug=github)
    --help                Display this help message
  
  Examples:
    npx show-nextjs-routers
    npx show-nextjs-routers -t
    npx show-nextjs-routers -h https://example.com
    npx show-nextjs-routers -s brand=github -s category=coding
  `);
}

/**
 * Main function
 * @param {Array} args - Command line arguments
 */
function main(args) {
  // Handle help request
  if (args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Parse options
  const options = parseOptions(args);

  // Find app directory
  const appDir = options.appDir || findAppDirectory(process.cwd());

  if (!appDir) {
    console.error('Next.js app directory not found.');
    console.error(
      'Please run from the root of a Next.js project or use -d option to specify app directory.'
    );
    process.exit(1);
  }

  // Analyze and display routes
  analyzeRoutes(appDir, options.host, options.treeMode, options.slugs); // options.slugs 전달
}

module.exports = {
  main,
  findAppDirectory,
  parseOptions,
};
