const fs = require('fs');
const path = require('path');

/**
 * Default host URL
 */
const DEFAULT_HOST = 'http://localhost:3000';

/**
 * Convert [slug] format path to :slug format.
 * If a specific value for the slug is provided in the slugs object, use that value.
 * @param {string} name - Path name (e.g., "[brand]")
 * @param {object} [slugs={}] - An object mapping slug keys to their values (e.g., { brand: "mybrand" })
 * @return {string} Converted path name (e.g., "mybrand" or ":brand")
 */
function asName(name, slugs = {}) {
  if (name.startsWith('[') && name.endsWith(']')) {
    const slugKey = name.substring(1, name.length - 1);
    if (slugs && slugs[slugKey]) {
      return slugs[slugKey];
    }
    return `:${slugKey}`;
  }
  return name;
}

/**
 * Check if a path segment is a route group
 * @param {string} segment - Path segment
 * @return {boolean} Whether it's a route group
 */
function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')');
}

/**
 * Generate Next.js route tree structure from a given directory
 * @param {string} dir - Starting directory (app directory)
 * @param {string} host - Host URL
 * @param {object} [slugs={}] - An object mapping slug keys to their values
 * @param {string} relativePath - Relative path (used in recursive calls)
 * @param {Array} routeSegments - URL path segments (excluding route groups)
 * @return {object|null} Route tree structure or null (if no routes)
 */
function buildTree(dir, host = DEFAULT_HOST, slugs = {}, relativePath = '', routeSegments = []) {
  // Return null if the directory doesn't exist
  if (!fs.existsSync(dir)) {
    return null;
  }

  try {
    const files = fs.readdirSync(dir);
    const segments = relativePath ? relativePath.split(path.sep) : [];
    // The nodeName for the current level should also reflect slug substitution
    const nodeName = segments.length === 0 ? '/' : asName(segments[segments.length - 1], slugs);
    
    // Find page file (Next.js route definition file)
    const pageFile = files.find(f => /^page\.(js|jsx|ts|tsx)$/.test(f));
    let routePath = null;

    // Generate route path if page file exists (excluding route groups)
    if (pageFile) {
      // Replace dynamic segments with slug values or :slug format
      const processedRouteSegments = routeSegments.map(segment => asName(segment, slugs));
      let route = processedRouteSegments.join('/');
      routePath = host + (route ? '/' + route : '');
    }

    // Explore child folders
    const children = [];
    for (const file of files) {
      // Exclude certain folders according to Next.js routing rules
      if (file.startsWith('_')) continue; // _app, _document, etc.
      if (file === 'api') continue; // API routes

      const fullPath = path.join(dir, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        // Check if current segment is a route group
        const isGroup = isRouteGroup(file);
        
        // Calculate next path segment (relative path always includes all folders)
        const nextRelativePath = relativePath ? path.join(relativePath, file) : file;
        
        // Route segments only include non-route group folders
        const nextRouteSegments = [...routeSegments];
        if (!isGroup) {
          // For route segments, we keep the original [slug] format
          // asName will handle the conversion to :slug or actual value later
          nextRouteSegments.push(file); 
        }
        
        const childTree = buildTree(
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
            name: '📁 ' + childTree.name // childTree.name is already slug-aware
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
 * Print tree structure as text
 * @param {object} node - Tree node
 * @param {object} [slugs={}] - An object mapping slug keys to their values (currently not directly used by printTree)
 * @param {string} prefix - Line prefix (used in recursive calls)
 * @param {boolean} isRoot - Whether this is the root node
 */
function printTree(node, slugs = {}, prefix = '', isRoot = true) {
  // Node name is already processed by buildTree, routePath also
  const urlStr = node.routePath ? ` [${node.routePath}]` : '';
  
  if (isRoot) {
    console.log(node.name + urlStr);
  }

  node.children.forEach((child, i) => {
    const isLast = i === node.children.length - 1;
    const branch = isLast ? '└─ ' : '├─ ';
    // Child node name and routePath are already processed
    const childUrlStr = child.routePath ? ` [${child.routePath}]` : '';
    
    console.log(prefix + branch + child.name + childUrlStr);
    
    // Recursively print children if they exist
    if (child.children && child.children.length > 0) {
      const nextPrefix = prefix + (isLast ? '   ' : '│  ');
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
    node.children.forEach(child => printUrls(child, slugs)); // Pass slugs
  }
}

/**
 * Analyze route structure of a Next.js app
 * @param {string} appDir - Next.js app directory path
 * @param {string} host - Host URL
 * @param {boolean} treeMode - Whether to output in tree mode
 * @param {object} [slugs={}] - An object mapping slug keys to their values
 * @return {object|null} Analyzed route tree structure
 */
function analyzeRoutes(appDir, host = DEFAULT_HOST, treeMode = false, slugs = {}) { // slugs 인자 추가
  const tree = buildTree(appDir, host, slugs); // slugs 전달
  
  if (tree) {
    if (treeMode) {
      printTree(tree, slugs); // slugs 전달
    } else {
      printUrls(tree, slugs); // slugs 전달
    }
    return tree;
  }
  
  console.error('Route structure not found. Please check your Next.js app directory.');
  return null;
}

module.exports = {
  analyzeRoutes,
  buildTree,
  printTree,
  printUrls,
  asName
};