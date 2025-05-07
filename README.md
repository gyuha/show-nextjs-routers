# show-nextjs-routers

A CLI tool that visually displays the router structure of Next.js applications.

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

Display help:
```bash
npx show-nextjs-routers --help
```

## Features

- Automatic detection of Next.js App Router structure
- Route visualization in URL list or tree format
- Dynamic route conversion ([slug] → :slug)
- Support for various Next.js routing rules
- Support for Route Groups (folders with parentheses)

## Requirements

- Node.js 15.0.0 or higher
- Use app router

## License

ISC