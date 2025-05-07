const fs = require('fs');
const path = require('path');

/**
 * 기본 호스트 URL
 */
const DEFAULT_HOST = 'http://localhost:3000';

/**
 * [slug] 형식의 경로명을 :slug 형식으로 변환
 * @param {string} name - 경로명
 * @return {string} 변환된 경로명
 */
function asName(name) {
  return name.replace(/\[([^\]]+)\]/g, ':$1');
}

/**
 * 주어진 디렉토리에서 Next.js 라우트 트리 구조 생성
 * @param {string} dir - 시작 디렉토리 (app 디렉토리)
 * @param {string} host - 호스트 URL
 * @param {string} relativePath - 상대 경로 (재귀 호출에서 사용)
 * @return {object|null} 라우트 트리 구조 또는 null (라우트가 없는 경우)
 */
function buildTree(dir, host = DEFAULT_HOST, relativePath = '') {
  // 디렉토리가 존재하지 않으면 null 반환
  if (!fs.existsSync(dir)) {
    return null;
  }

  try {
    const files = fs.readdirSync(dir);
    const segments = relativePath ? relativePath.split(path.sep) : [];
    const nodeName = segments.length === 0 ? '/' : asName(segments[segments.length - 1]);

    // page 파일 찾기 (Next.js의 라우트 정의 파일)
    const pageFile = files.find(f => /^page\.(js|jsx|ts|tsx)$/.test(f));
    let routePath = null;

    // 페이지 파일이 있으면 라우트 경로 생성
    if (pageFile) {
      let route = segments.map(asName).join('/');
      routePath = host + (route ? '/' + route : '');
    }

    // 자식 폴더 탐색
    const children = [];
    for (const file of files) {
      // Next.js 라우팅 규칙에 따라 특정 폴더는 제외
      if (file.startsWith('_')) continue; // _app, _document 등
      if (file === 'api') continue; // API 라우트
      if (file.startsWith('(') && file.endsWith(')')) continue; // 라우트 그룹

      const fullPath = path.join(dir, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        const childTree = buildTree(
          fullPath, 
          host, 
          relativePath ? path.join(relativePath, file) : file
        );
        
        if (childTree) {
          children.push({
            ...childTree,
            name: '📁 ' + childTree.name
          });
        }
      }
    }

    // 페이지가 없고 자식도 없으면 null 반환
    if (!pageFile && children.length === 0) return null;
    
    // 자식 노드 알파벳 순으로 정렬
    children.sort((a, b) => a.name.localeCompare(b.name));
    
    return { name: nodeName, routePath, children };
  } catch (error) {
    console.error(`디렉토리 분석 오류: ${dir}`, error);
    return null;
  }
}

/**
 * 트리 구조를 텍스트로 출력
 * @param {object} node - 트리 노드
 * @param {string} prefix - 라인 접두사 (재귀 호출에서 사용)
 * @param {boolean} isRoot - 루트 노드 여부
 */
function printTree(node, prefix = '', isRoot = true) {
  const urlStr = node.routePath ? ` [${node.routePath}]` : '';
  
  if (isRoot) {
    console.log(node.name + urlStr);
  }

  node.children.forEach((child, i) => {
    const isLast = i === node.children.length - 1;
    const branch = isLast ? '└─ ' : '├─ ';
    const childUrlStr = child.routePath ? ` [${child.routePath}]` : '';
    
    console.log(prefix + branch + child.name + childUrlStr);
    
    // 자식 노드가 있으면 재귀 호출
    if (child.children && child.children.length > 0) {
      const nextPrefix = prefix + (isLast ? '   ' : '│  ');
      printTree(child, nextPrefix, false);
    }
  });
}

/**
 * URL 목록만 출력
 * @param {object} node - 트리 노드
 */
function printUrls(node) {
  // 현재 노드의 URL이 있으면 출력
  if (node.routePath) {
    console.log(node.routePath);
  }
  
  // 모든 자식 노드에 대해 재귀적으로 URL 출력
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => printUrls(child));
  }
}

/**
 * Next.js 앱의 라우트 구조 분석
 * @param {string} appDir - Next.js app 디렉토리 경로
 * @param {string} host - 호스트 URL
 * @param {boolean} treeMode - 트리 모드 출력 여부
 * @return {object|null} 분석된 라우트 트리 구조
 */
function analyzeRoutes(appDir, host = DEFAULT_HOST, treeMode = false) {
  const tree = buildTree(appDir, host);
  
  if (tree) {
    if (treeMode) {
      printTree(tree);
    } else {
      printUrls(tree);
    }
    return tree;
  }
  
  console.error('라우트 구조를 찾을 수 없습니다. Next.js 앱 디렉토리를 확인해주세요.');
  return null;
}

module.exports = {
  analyzeRoutes,
  buildTree,
  printTree,
  printUrls,
  asName
};