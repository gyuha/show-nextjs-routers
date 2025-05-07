# 작업 목표
- npx로 실행 할 수 있는 어플리케이션을 만들려고 함.
- cli에서 아래와 같이 명령어로 실행
    > npx show-nextjs-routers -t
```
아래와 같이 표시 해 줘
http://localhost:3000/
http://localhost:3000/:brand/regional/sales-operation-trim/spec-group-editor
http://localhost:3000/sample
```
- cli에서 아래와 같이 -t 파라메터를 추가 하면
    > npx show-nextjs-routers -t
    아래와 같이 표시 해 줘
```
/ [http://localhost:3000]
├─ 📁 :brand
│  └─ 📁 regional
│     └─ 📁 sales-operation-trim
│        └─ 📁 spec-group-editor [http://localhost:3000/:brand/regional/sales-operation-trim/spec-group-editor]
└─ 📁 sample [http://localhost:3000/sample]
```
- 제작 된 어플리케이션은 npmjs.org에 올려줘

## 참고 소스
```js
const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "../src/app");
const HOST = "http://localhost:3000";

// [slug] → :slug 변환
function asName(name) {
  return name.replace(/\[([^\]]+)\]/g, ":$1");
}

// 트리 구조 만들기
function buildTree(dir, relativePath = "") {
  const files = fs.readdirSync(dir);
  const segments = relativePath ? relativePath.split(path.sep) : [];
  const nodeName = segments.length === 0 ? "/" : asName(segments[segments.length - 1]);

  const pageFile = files.find(f => /^page\.(js|jsx|ts|tsx)$/.test(f));
  let routePath = null;
  if (pageFile) {
    let route = segments.map(asName).join("/");
    routePath = HOST + (route ? "/" + route : "");
  }

  // 자식 폴더
  const children = [];
  for (const file of files) {
    if (file.startsWith("_")) continue;
    if (file === "api") continue;
    if (file.startsWith("(") && file.endsWith(")")) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      const childTree = buildTree(fullPath, relativePath ? path.join(relativePath, file) : file);
      if (childTree) {
        children.push({
          ...childTree,
          name: "📁 " + childTree.name
        });
      }
    }
  }

  if (!pageFile && children.length === 0) return null;
  children.sort((a, b) => a.name.localeCompare(b.name));
  return { name: nodeName, routePath, children };
}

function printTree(node, prefix = "", isRoot = true) {
  const urlStr = node.routePath ? ` [${node.routePath}]` : "";
  if (isRoot) {
    console.log(node.name + urlStr);
  }

  node.children.forEach((child, i) => {
    const isLast = i === node.children.length - 1;
    const branch = isLast ? "└─ " : "├─ ";
    const childUrlStr = child.routePath ? ` [${child.routePath}]` : "";
    console.log(prefix + branch + child.name + childUrlStr);
    // 자식 있으면 prefix채우고 재귀(현재라인이 마지막이면 '   ', 아니면 '│  ')
    if (child.children && child.children.length > 0) {
      const nextPrefix = prefix + (isLast ? "   " : "│  ");
      printTree(child, nextPrefix, false);
    }
  });
}

// 실행
const tree = buildTree(APP_DIR);
if (tree) printTree(tree);
```

## 작업 진행
project_plan.md 파일을 만들고, 체크리스트를 만들어 줘
작업이 진행 될 때 마다.. 체크리스트에 체크를 해서 지속적으로 개발이 가능 하도록 해 줘

## Please follow the instructions below
- Always respond in Korean
- Follow the user’s requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, up to date, bug free, fully functional and working, secure, performant and efficient code.
- Focus on readability over being performant.
- Fully implement all requested functionality.
- Leave NO todo’s, placeholders or missing pieces.
- Ensure code is complete! Verify thoroughly finalized.
- Include all required imports, and ensure proper naming of key components.
- Be concise. Minimize any other prose.


