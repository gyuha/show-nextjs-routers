const path = require('path');
const fs = require('fs');
const { analyzeRoutes } = require('./router-analyzer');

/**
 * Next.js 앱 디렉토리 찾기
 * @param {string} startDir - 시작 디렉토리
 * @return {string|null} 앱 디렉토리 경로 또는 null
 */
function findAppDirectory(startDir) {
  // 현재 디렉토리에서 'src/app' 찾기
  const srcAppPath = path.join(startDir, 'src', 'app');
  if (fs.existsSync(srcAppPath) && fs.statSync(srcAppPath).isDirectory()) {
    return srcAppPath;
  }
  
  // 현재 디렉토리에서 'app' 찾기
  const appPath = path.join(startDir, 'app');
  if (fs.existsSync(appPath) && fs.statSync(appPath).isDirectory()) {
    return appPath;
  }
  
  return null;
}

/**
 * CLI 옵션 파싱
 * @param {Array} args - 커맨드 라인 인자
 * @return {Object} 파싱된 옵션
 */
function parseOptions(args) {
  const options = {
    treeMode: false,
    host: 'http://localhost:3000',
    appDir: null
  };
  
  // 인자 파싱
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
    }
  }
  
  return options;
}

/**
 * CLI 도움말 표시
 */
function showHelp() {
  console.log(`
  Usage: npx show-nextjs-routers [options]
  
  Options:
    -t, --tree            Display route structure in tree format
    -h, --host <url>      Set base host URL (default: http://localhost:3000)
    -d, --dir <path>      Directly specify Next.js app directory
    --help                Display this help message
  
  Examples:
    npx show-nextjs-routers
    npx show-nextjs-routers -t
    npx show-nextjs-routers -h https://example.com
  `);
}

/**
 * 메인 함수
 * @param {Array} args - 커맨드 라인 인자
 */
function main(args) {
  // 도움말 요청 처리
  if (args.includes('--help')) {
    showHelp();
    process.exit(0);
  }
  
  // 옵션 파싱
  const options = parseOptions(args);
  
  // 앱 디렉토리 찾기
  const appDir = options.appDir || findAppDirectory(process.cwd());
  
  if (!appDir) {
    console.error('Next.js app directory not found.');
    console.error('Please run from the root of a Next.js project or use -d option to specify app directory.');
    process.exit(1);
  }
  
  // 라우트 분석 및 출력
  analyzeRoutes(appDir, options.host, options.treeMode);
}

module.exports = {
  main,
  findAppDirectory,
  parseOptions
};