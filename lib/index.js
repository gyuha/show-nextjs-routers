const path = require("path");
const fs = require("fs");
const { analyzeRoutes, ROUTER_TYPE } = require("./router-analyzer");

/**
 * Find Next.js app or pages directory
 * @param {string} startDir - Starting directory
 * @return {object|null} Object with directory path and detected router type or null
 */
function findNextJsDirectory(startDir) {
  // 가능한 디렉토리 구조 확인
  const possiblePaths = [
    // App Router 가능성
    { path: path.join(startDir, "src", "app"), type: ROUTER_TYPE.APP },
    { path: path.join(startDir, "app"), type: ROUTER_TYPE.APP },
    // Pages Router 가능성
    { path: path.join(startDir, "src", "pages"), type: ROUTER_TYPE.PAGES },
    { path: path.join(startDir, "pages"), type: ROUTER_TYPE.PAGES },
  ];


  // 존재하는 첫 번째 경로 반환
  for (const pathInfo of possiblePaths) {
    if (
      fs.existsSync(pathInfo.path) &&
      fs.statSync(pathInfo.path).isDirectory()
    ) {
      return { dir: pathInfo.path, type: pathInfo.type };
    }
  }

  console.log("Directory not found");
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
    } else if (arg === "-f" || arg === "--force") {
      if (i + 1 < args.length) {
        const routerArg = args[i + 1].toLowerCase();
        if (routerArg === "app" || routerArg === "pages") {
          options.routerType = routerArg;
        }
        i++;
      }
    } else if (arg === "-r" || arg === "--replace") {
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

  return options;
}

/**
 * Display CLI help
 */
function showHelp() {
  console.log(`
  Usage: npx show-nextjs-routers [options]
  
  Options:
    -t, --tree            Display routes in directory structure format
    -h, --host <url>      Set base host URL (default: http://localhost:3000)
    -d, --dir <path>      Specify Next.js app or pages directory directly
    -f, --force <type>    Force router type (app or pages)
    -r, --replace <key=value> Replace dynamic route segments (example: slug=github)
    --help                Display help information
  
  Examples:
    npx show-nextjs-routers
    npx show-nextjs-routers -t
    npx show-nextjs-routers -h https://example.com
    npx show-nextjs-routers -f app
    npx show-nextjs-routers -f pages
    npx show-nextjs-routers -r brand=github -r category=coding
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
    routerDir = options.appDir;
  } else {
    // 자동으로 Next.js 디렉토리 찾기
    const dirInfo = findNextJsDirectory(process.cwd());
    if (dirInfo) {
      routerDir = dirInfo.dir;
      // 라우터 타입이 명시적으로 지정되지 않았을 경우에만 자동 감지된 타입 사용
      if (!routerType) {
        routerType = dirInfo.type;
      }
    }
  }

  if (!routerDir) {
    console.error("Cannot find Next.js directory.");
    console.error(
      "Please run from the Next.js project root or use the -d option to specify the app or pages directory."
    );
    process.exit(1);
  }

  // 경로 확인 및 정규화
  try {
    const resolvedPath = path.resolve(routerDir);

    // 디렉토리 존재 여부 확인
    if (!fs.existsSync(resolvedPath)) {
      console.error("Specified path does not exist:", resolvedPath);
      process.exit(1);
    }

    // 디렉토리인지 확인
    if (!fs.statSync(resolvedPath).isDirectory()) {
      console.error("Specified path is not a directory:", resolvedPath);
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
    console.error("Error occurred:", error);
    process.exit(1);
  }
}

module.exports = {
  main,
  findNextJsDirectory,
  parseOptions,
};
