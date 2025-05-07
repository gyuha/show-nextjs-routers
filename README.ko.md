# show-nextjs-routers

Next.js 애플리케이션의 라우터 구조를 시각적으로 표시해주는 CLI 도구입니다.

> [!WARNING]
> Next.js 15이상 app라우터를 쓰는 환경만 지원 합니다.

## 설치

```bash
npm install -g show-nextjs-routers
```

또는 npx를 사용하여 설치 없이 실행할 수 있습니다:

```bash
npx show-nextjs-routers
```

## 사용법

### 기본 사용법 (URL 목록 표시)

Next.js 프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
npx show-nextjs-routers
```

결과 예시:
```
http://localhost:3000
http://localhost:3000/:brand/sales/item
http://localhost:3000/list
http://localhost:3000/sample
http://localhost:3000/sample/node
```

### 트리 모드 (계층 구조 표시)

트리 구조로 라우트를 시각화하려면 `-t` 또는 `--tree` 옵션을 사용합니다:

```bash
npx show-nextjs-routers -t
```

결과 예시:
```
/ [http://localhost:3000]
├─ 📁 :brand
│  └─ 📁 sales
│     └─ 📁 item [http://localhost:3000/:brand/sales/item]
├─ 📁 (test)
│  └─ 📁 list [http://localhost:3000/list]
└─ 📁 sample [http://localhost:3000/sample]
   └─ 📁 node [http://localhost:3000/sample/node]
```

### 추가 옵션

호스트 URL 변경:
```bash
npx show-nextjs-routers -h https://example.com
```

앱 디렉토리 직접 지정:
```bash
npx show-nextjs-routers -d ./src/app
```

도움말 표시:
```bash
npx show-nextjs-routers --help
```

## 특징

- Next.js App Router 구조 자동 감지
- URL 목록 또는 트리 형태로 라우트 시각화
- 동적 라우트 ([slug] → :slug) 변환
- 다양한 Next.js 라우팅 규칙 지원

## 요구사항

- Node.js 15.0.0 이상
- App 라우터 사용

## 라이센스

ISC