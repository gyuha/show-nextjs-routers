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
  사용법: npx show-nextjs-routers [옵션]
  
  옵션:
    -t, --tree            트리 형태로 라우트 구조를 표시합니다
    -h, --host <url>      기본 호스트 URL 설정 (기본값: http://localhost:3000)
    -d, --dir <path>      Next.js 앱 디렉토리 직접 지정
    --help                이 도움말을 표시합니다
  
  예시:
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
    console.error('Next.js 앱 디렉토리를 찾을 수 없습니다.');
    console.error('Next.js 프로젝트 루트에서 실행하거나 -d 옵션으로 앱 디렉토리를 지정해주세요.');
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