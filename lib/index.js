const path = require("path");
const fs = require("fs");
const { analyzeRoutes, ROUTER_TYPE } = require("./router-analyzer");

/**
 * Find Next.js app or pages directory
 * @param {string} startDir - Starting directory
 * @return {object|null} Object with directory path and detected router type or null
 */
function findNextJsDirectory(startDir) {
  console.log("디렉토리 찾기 시작:", startDir);
  // 가능한 디렉토리 구조 확인
  const possiblePaths = [
    // App Router 가능성
    { path: path.join(startDir, "src", "app"), type: ROUTER_TYPE.APP },
    { path: path.join(startDir, "app"), type: ROUTER_TYPE.APP },
    // Pages Router 가능성
    { path: path.join(startDir, "src", "pages"), type: ROUTER_TYPE.PAGES },
    { path: path.join(startDir, "pages"), type: ROUTER_TYPE.PAGES },
  ];

  console.log(
    "확인할 가능한 경로들:",
    possiblePaths.map((p) => p.path)
  );

  // 존재하는 첫 번째 경로 반환
  for (const pathInfo of possiblePaths) {
    console.log("경로 확인 중:", pathInfo.path);
    if (
      fs.existsSync(pathInfo.path) &&
      fs.statSync(pathInfo.path).isDirectory()
    ) {
      console.log("발견된 경로:", pathInfo.path, "타입:", pathInfo.type);
      return { dir: pathInfo.path, type: pathInfo.type };
    }
  }

  console.log("디렉토리를 찾을 수 없음");
  return null;
}

/**
 * Parse CLI options
 * @param {Array} args - Command line arguments
 * @return {Object} Parsed options
 */
function parseOptions(args) {
  // console.log("명령어 인자 파싱:", args);
  const options = {
    treeMode: false,
    host: "http://localhost:3000",
    appDir: null,
    routerType: null,
    slugs: {},
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-t" || arg === "--tree") {
      options.treeMode = true;
    } else if (arg === "-h" || arg === "--host") {
      if (i + 1 < args.length) {
        options.host = args[i + 1];
        i++;
      }
    } else if (arg === "-d" || arg === "--dir") {
      if (i + 1 < args.length) {
        options.appDir = args[i + 1];
        i++;
      }
    } else if (arg === "-r" || arg === "--router") {
      if (i + 1 < args.length) {
        const routerArg = args[i + 1].toLowerCase();
        if (routerArg === "app" || routerArg === "pages") {
          options.routerType = routerArg;
        }
        i++;
      }
    } else if (arg === "-s" || arg === "--slug") {
      if (i + 1 < args.length) {
        const slugArg = args[i + 1];
        const [key, value] = slugArg.split("=");
        if (key && value) {
          options.slugs[key] = value;
        }
        i++;
      }
    }
  }

  // console.log("파싱된 옵션:", options);
  return options;
}

/**
 * Display CLI help
 */
function showHelp() {
  console.log(`
  Usage: npx show-nextjs-routers [options]
  
  Options:
    -t, --tree            디렉토리 구조 형태로 라우트 표시
    -h, --host <url>      기본 호스트 URL 설정 (기본값: http://localhost:3000)
    -d, --dir <path>      Next.js app 또는 pages 디렉토리 직접 지정
    -r, --router <type>   라우터 타입 강제 지정 (app 또는 pages)
    -s, --slug <key=value> 동적 라우트 세그먼트 치환 (예: slug=github)
    --help                도움말 표시
  
  Examples:
    npx show-nextjs-routers
    npx show-nextjs-routers -t
    npx show-nextjs-routers -h https://example.com
    npx show-nextjs-routers -r app
    npx show-nextjs-routers -r pages
    npx show-nextjs-routers -s brand=github -s category=coding
  `);
}

/**
 * Main function
 * @param {Array} args - Command line arguments
 */
function main(args) {
  // Handle help request
  if (args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // Parse options
  const options = parseOptions(args);

  let routerDir = null;
  let routerType = options.routerType;

  if (options.appDir) {
    // console.log('지정된 디렉토리 사용:', options.appDir);
    routerDir = options.appDir;
  } else {
    // 자동으로 Next.js 디렉토리 찾기
    // console.log('자동으로 Next.js 디렉토리 찾는 중...');
    const dirInfo = findNextJsDirectory(process.cwd());
    if (dirInfo) {
      routerDir = dirInfo.dir;
      // console.log('찾은 디렉토리:', routerDir);
      // 라우터 타입이 명시적으로 지정되지 않았을 경우에만 자동 감지된 타입 사용
      if (!routerType) {
        routerType = dirInfo.type;
        // console.log('자동 감지된 라우터 타입:', routerType);
      }
    }
  }

  if (!routerDir) {
    console.error("Next.js 디렉토리를 찾을 수 없습니다.");
    console.error(
      "Next.js 프로젝트 루트에서 실행하거나 -d 옵션을 사용하여 app 또는 pages 디렉토리를 지정해주세요."
    );
    process.exit(1);
  }

  // 경로 확인 및 정규화
  try {
    const resolvedPath = path.resolve(routerDir);

    // 디렉토리 존재 여부 확인
    if (!fs.existsSync(resolvedPath)) {
      console.error("지정된 경로가 존재하지 않습니다:", resolvedPath);
      process.exit(1);
    }

    // 디렉토리인지 확인
    if (!fs.statSync(resolvedPath).isDirectory()) {
      console.error("지정된 경로가 디렉토리가 아닙니다:", resolvedPath);
      process.exit(1);
    }

    // 디렉토리 내용 확인
    const files = fs.readdirSync(resolvedPath);

    // 라우트 분석 및 표시
    analyzeRoutes(
      resolvedPath,
      options.host,
      options.treeMode,
      options.slugs,
      routerType
    );
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

module.exports = {
  main,
  findNextJsDirectory,
  parseOptions,
};
