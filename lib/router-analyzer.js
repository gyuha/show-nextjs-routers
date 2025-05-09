const fs = require("fs");
const path = require("path");

/**
 * Default host URL
 */
const DEFAULT_HOST = "http://localhost:3000";

/**
 * Router types
 */
const ROUTER_TYPE = {
  APP: "app",
  PAGES: "pages",
};

/**
 * Convert [slug] format path to :slug format.
 * If a specific value for the slug is provided in the slugs object, use that value.
 * @param {string} name - Path name (e.g., "[brand]")
 * @param {object} [slugs={}] - An object mapping slug keys to their values (e.g., { brand: "mybrand" })
 * @return {string} Converted path name (e.g., "mybrand" or ":brand")
 */
function asName(name, slugs = {}) {
  // App Router: [slug] or [...slug] format
  if (name.startsWith("[") && name.endsWith("]")) {
    // Handle [...slug] (catch-all routes)
    if (name.startsWith("[...")) {
      const slugKey = name.substring(4, name.length - 1);
      if (slugs && slugs[slugKey]) {
        return slugs[slugKey];
      }
      return `:${slugKey}*`;
    }
    // Handle [[...slug]] (optional catch-all routes)
    else if (name.startsWith("[[...") && name.endsWith("]]")) {
      const slugKey = name.substring(5, name.length - 2);
      if (slugs && slugs[slugKey]) {
        return slugs[slugKey];
      }
      return `:${slugKey}*?`;
    }
    // Regular [slug]
    const slugKey = name.substring(1, name.length - 1);
    if (slugs && slugs[slugKey]) {
      return slugs[slugKey];
    }
    return `:${slugKey}`;
  }

  // Pages Router: [slug] or [[slug]] (optional) format
  // Pages Router also uses [slug] format, so the above will handle it
  // Additional format: [[slug]] (optional)
  if (name.startsWith("[[") && name.endsWith("]]")) {
    const slugKey = name.substring(2, name.length - 2);
    if (slugs && slugs[slugKey]) {
      return slugs[slugKey];
    }
    return `:${slugKey}?`;
  }

  return name;
}

/**
 * Check if a path segment is a route group
 * @param {string} segment - Path segment
 * @return {boolean} Whether it's a route group
 */
function isRouteGroup(segment) {
  return segment.startsWith("(") && segment.endsWith(")");
}

/**
 * Generate Next.js App Router tree structure from a given directory
 * @param {string} dir - Starting directory (app directory)
 * @param {string} host - Host URL
 * @param {object} [slugs={}] - An object mapping slug keys to their values
 * @param {string} relativePath - Relative path (used in recursive calls)
 * @param {Array} routeSegments - URL path segments (excluding route groups)
 * @return {object|null} Route tree structure or null (if no routes)
 */
function buildAppTree(
  dir,
  host = DEFAULT_HOST,
  slugs = {},
  relativePath = "",
  routeSegments = []
) {
  // Return null if the directory doesn't exist
  if (!fs.existsSync(dir)) {
    return null;
  }

  try {
    const files = fs.readdirSync(dir);
    const segments = relativePath ? relativePath.split(path.sep) : [];
    // The nodeName for the current level should also reflect slug substitution
    const nodeName =
      segments.length === 0
        ? "/"
        : asName(segments[segments.length - 1], slugs);

    // Find page file (Next.js route definition file)
    const pageFile = files.find((f) => /^page\.(js|jsx|ts|tsx)$/.test(f));
    let routePath = null;

    // Generate route path if page file exists (excluding route groups)
    if (pageFile) {
      // Replace dynamic segments with slug values or :slug format
      const processedRouteSegments = routeSegments.map((segment) =>
        asName(segment, slugs)
      );
      let route = processedRouteSegments.join("/");
      routePath = host + (route ? "/" + route : "");
    }

    // Explore child folders
    const children = [];
    for (const file of files) {
      // Exclude certain folders according to Next.js routing rules
      if (file.startsWith("_")) continue; // _app, _document, etc.
      if (file === "api") continue; // API routes

      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        // Check if current segment is a route group
        const isGroup = isRouteGroup(file);

        // Calculate next path segment (relative path always includes all folders)
        const nextRelativePath = relativePath
          ? path.join(relativePath, file)
          : file;

        // Route segments only include non-route group folders
        const nextRouteSegments = [...routeSegments];
        if (!isGroup) {
          // For route segments, we keep the original [slug] format
          // asName will handle the conversion to :slug or actual value later
          nextRouteSegments.push(file);
        }

        const childTree = buildAppTree(
          fullPath,
          host,
          slugs, // Pass slugs to recursive calls
          nextRelativePath,
          nextRouteSegments
        );

        if (childTree) {
          // Node name should reflect the slug value if provided, or :slug
          // childTree.name is already processed by the recursive call's asName
          children.push({
            ...childTree,
            name: "📁 " + childTree.name, // childTree.name is already slug-aware
          });
        }
      }
    }

    // Return null if no page file and no children
    if (!pageFile && children.length === 0) return null;

    // Sort child nodes alphabetically
    children.sort((a, b) => a.name.localeCompare(b.name));

    return { name: nodeName, routePath, children };
  } catch (error) {
    console.error(`Directory analysis error: ${dir}`, error);
    return null;
  }
}

/**
 * Generate Next.js Pages Router tree structure from a given directory
 * @param {string} dir - Starting directory (pages directory)
 * @param {string} host - Host URL
 * @param {object} [slugs={}] - An object mapping slug keys to their values
 * @param {string} relativePath - Relative path (used in recursive calls)
 * @return {object|null} Route tree structure or null (if no routes)
 */
function buildPagesTree(
  dir,
  host = DEFAULT_HOST,
  slugs = {},
  relativePath = ""
) {
  // Return null if the directory doesn't exist
  if (!fs.existsSync(dir)) {
    return null;
  }

  try {
    const files = fs.readdirSync(dir);
    const segments = relativePath ? relativePath.split(path.sep) : [];
    const nodeName =
      segments.length === 0
        ? "/"
        : asName(segments[segments.length - 1], slugs);

    // Process current directory files to find routes
    const children = [];
    let isRouteNode = false;

    for (const file of files) {
      const fullPath = path.join(dir, file);

      // Skip _app.js, _document.js, etc.
      if (file.startsWith("_")) continue;

      // Handle directories
      if (fs.statSync(fullPath).isDirectory()) {
        const nextRelativePath = relativePath
          ? path.join(relativePath, file)
          : file;
        const childTree = buildPagesTree(
          fullPath,
          host,
          slugs,
          nextRelativePath
        );

        if (childTree) {
          children.push({
            ...childTree,
            name: "📁 " + childTree.name,
          });
        }
      }
      // Handle JS/TS files that define routes
      else if (
        /\.(js|jsx|ts|tsx)$/.test(file) &&
        file !== "index.js" &&
        file !== "index.tsx"
      ) {
        // Remove file extension
        const fileName = file.replace(/\.(js|jsx|ts|tsx)$/, "");

        // Skip API routes for url listing (but keep for tree visualization)
        if (
          fileName === "api" ||
          (relativePath && relativePath.includes("api"))
        ) {
          continue;
        }

        const processedName = asName(fileName, slugs);
        const pathSegments = relativePath
          ? relativePath.split(path.sep).map((seg) => asName(seg, slugs))
          : [];

        // Create URL route
        let route;
        if (pathSegments.length > 0) {
          route = [...pathSegments, processedName].join("/");
        } else {
          route = processedName;
        }

        const routePath = host + "/" + route;

        children.push({
          name: processedName,
          routePath,
          children: [],
        });

        isRouteNode = true;
      }
      // Handle index files for current directory
      else if (file === "index.js" || file === "index.tsx") {
        isRouteNode = true;
      }
    }

    // Sort child nodes alphabetically
    children.sort((a, b) => a.name.localeCompare(b.name));

    // Calculate current node's route path
    let routePath = null;
    if (isRouteNode) {
      if (relativePath) {
        const processedSegments = relativePath
          .split(path.sep)
          .map((seg) => asName(seg, slugs));
        routePath = host + "/" + processedSegments.join("/");
      } else {
        routePath = host;
      }
    }

    // Return null if no routes
    if (!isRouteNode && children.length === 0) return null;

    return { name: nodeName, routePath, children };
  } catch (error) {
    console.error(`Directory analysis error: ${dir}`, error);
    return null;
  }
}

/**
 * Print tree structure as text
 * @param {object} node - Tree node
 * @param {object} [slugs={}] - An object mapping slug keys to their values (currently not directly used by printTree)
 * @param {string} prefix - Line prefix (used in recursive calls)
 * @param {boolean} isRoot - Whether this is the root node
 */
function printTree(node, slugs = {}, prefix = "", isRoot = true) {
  // Node name is already processed by buildTree, routePath also
  const urlStr = node.routePath ? ` [${node.routePath}]` : "";

  if (isRoot) {
    console.log(node.name + urlStr);
  }

  node.children.forEach((child, i) => {
    const isLast = i === node.children.length - 1;
    const branch = isLast ? "└─ " : "├─ ";
    // Child node name and routePath are already processed
    const childUrlStr = child.routePath ? ` [${child.routePath}]` : "";

    console.log(prefix + branch + child.name + childUrlStr);

    // Recursively print children if they exist
    if (child.children && child.children.length > 0) {
      const nextPrefix = prefix + (isLast ? "   " : "│  ");
      printTree(child, slugs, nextPrefix, false); // Pass slugs
    }
  });
}

/**
 * Print only URL list
 * @param {object} node - Tree node
 * @param {object} [slugs={}] - An object mapping slug keys to their values (currently not directly used by printUrls)
 */
function printUrls(node, slugs = {}) {
  // routePath is already processed by buildTree with slug values
  if (node.routePath) {
    console.log(node.routePath);
  }

  // Recursively print URLs for all children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => printUrls(child, slugs)); // Pass slugs
  }
}

/**
 * Detect router type from directory structure
 * @param {string} dir - Directory to check
 * @return {string} Router type (ROUTER_TYPE.APP or ROUTER_TYPE.PAGES)
 */
function detectRouterType(dir) {
  // Check file structure to determine router type
  const baseName = path.basename(dir);

  if (baseName === "app") {
    return ROUTER_TYPE.APP;
  } else if (baseName === "pages") {
    return ROUTER_TYPE.PAGES;
  }

  // If directory name doesn't immediately reveal the type, check for page.js files (App Router)
  try {
    const hasPageFiles = findPageFilesRecursively(dir);
    if (hasPageFiles) {
      return ROUTER_TYPE.APP;
    }
  } catch (error) {
    // Ignore errors, proceed with further checks
  }

  // Default to Pages Router if we can't determine definitively
  return ROUTER_TYPE.PAGES;
}

/**
 * Check if directory has page.js files (recursively)
 * @param {string} dir - Directory to check
 * @return {boolean} True if page.js files found
 */
function findPageFilesRecursively(dir) {
  try {
    const files = fs.readdirSync(dir);

    // Check if any file is a page.js
    for (const file of files) {
      if (/^page\.(js|jsx|ts|tsx)$/.test(file)) {
        return true;
      }
    }

    // Recursively check subdirectories
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (findPageFilesRecursively(fullPath)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Analyze route structure of a Next.js app
 * @param {string} appDir - Next.js app or pages directory path
 * @param {string} host - Host URL
 * @param {boolean} treeMode - Whether to output in tree mode
 * @param {object} [slugs={}] - An object mapping slug keys to their values
 * @param {string} [routerType=null] - Force a specific router type (app or pages)
 * @return {object|null} Analyzed route tree structure
 */
function analyzeRoutes(
  appDir,
  host = DEFAULT_HOST,
  treeMode = false,
  slugs = {},
  routerType = null
) {
  // Auto-detect router type if not specified
  const detectedRouterType = routerType || detectRouterType(appDir);

  // Build tree based on router type
  let tree = null;

  if (detectedRouterType === ROUTER_TYPE.APP) {
    // console.log("🔍 Analyzing App Router structure...");
    tree = buildAppTree(appDir, host, slugs);
  } else {
    // console.log("🔍 Analyzing Pages Router structure...");
    tree = buildPagesTree(appDir, host, slugs);
  }

  if (tree) {
    if (treeMode) {
      printTree(tree, slugs);
    } else {
      printUrls(tree, slugs);
    }
    return tree;
  }

  console.error(
    `Route structure not found. Please check your Next.js ${detectedRouterType} directory.`
  );
  return null;
}

module.exports = {
  analyzeRoutes,
  buildAppTree,
  buildPagesTree,
  printTree,
  printUrls,
  asName,
  ROUTER_TYPE,
  detectRouterType,
};
