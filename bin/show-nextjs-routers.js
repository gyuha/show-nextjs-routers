#!/usr/bin/env node

const { main } = require("../lib/index");

// 명령행 인자 파싱 (node와 스크립트 이름을 제외한 인자들)
const args = process.argv.slice(2);

// 메인 함수 실행
main(args);
