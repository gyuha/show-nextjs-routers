<p align="right">English | <a href="./README.ko.md">한국어</a> | <a href="./README.ja.md">日本語</a></p>

# show-nextjs-routers

A CLI tool that visually displays the router structure of Next.js applications.

> [!Note]
> Only supports Next.js version 15 or higher.

## Installation

```bash
npm install -g show-nextjs-routers
```

Or you can run without installation using npx:

```bash
npx show-nextjs-routers
```

## Usage

### Basic Usage (Display URL List)

Run the following command in the root directory of your Next.js project:

```bash
npx show-nextjs-routers
```

Example output:
```
http://localhost:3000
http://localhost:3000/:brand/sales/item
http://localhost:3000/list
http://localhost:3000/sample
http://localhost:3000/sample/node
```

### Tree Mode (Display Hierarchy)

To visualize routes in a tree structure, use the `-t` or `--tree` option:

```bash
npx show-nextjs-routers -t
```

Example output:
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

### Additional Options

Change host URL:
```bash
npx show-nextjs-routers -h https://example.com
```

Directly specify app directory:
```bash
npx show-nextjs-routers -d ./src/app
```

Force router type:
```bash
npx show-nextjs-routers -f app
```
The `-f` or `--force` option allows you to force the router type (app or pages), which can be useful when automatic detection doesn't work as expected.

Replace dynamic route parameters:
```bash
npx show-nextjs-routers -r brand=cola
```
The `-r` or `--replace` option allows you to replace dynamic route parameters with actual values. For instance, using `-r brand=cola` will replace `:brand` with `cola` in the URLs. This is useful for testing specific route scenarios.

Example output with parameter replacement:
```
http://localhost:3000
http://localhost:3000/list
http://localhost:3000/cola/sales/item
http://localhost:3000/sample
http://localhost:3000/sample/node
```


Display help:
```bash
npx show-nextjs-routers --help
```

## Features

- Automatic detection of Next.js App Router structure
- Route visualization in URL list or tree format
- Dynamic route conversion ([slug] → :slug)
- Support for dynamic route parameter substitution
- Support for various Next.js routing rules
- Support for Route Groups (folders with parentheses)

## Requirements

- Node.js 15.0.0 or higher
- Use app router

## License

ISC