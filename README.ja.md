<p align="right"><a href="./README.md">English</a> | <a href="./README.ko.md">한국어</a> | 日本語</p>

# show-nextjs-routers

Next.jsアプリケーションのルーター構造を視覚的に表示するCLIツールです。

> [!Note]
> Next.js 15以上のみサポートしています。

## インストール

```bash
npm install -g show-nextjs-routers
```

またはnpxを使用してインストールせずに実行できます：

```bash
npx show-nextjs-routers
```

## 使用方法

### 基本的な使用法（URL一覧表示）

Next.jsプロジェクトのルートディレクトリで次のコマンドを実行します：

```bash
npx show-nextjs-routers
```

結果例：
```
http://localhost:3000
http://localhost:3000/:brand/sales/item
http://localhost:3000/list
http://localhost:3000/sample
http://localhost:3000/sample/node
```

### ツリーモード（階層構造表示）

ツリー構造でルートを視覚化するには、`-t`または`--tree`オプションを使用します：

```bash
npx show-nextjs-routers -t
```

結果例：
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

### 追加オプション

ホストURLの変更：
```bash
npx show-nextjs-routers -h https://example.com
```

アプリディレクトリの直接指定：
```bash
npx show-nextjs-routers -d ./src/app
```

ルータータイプの強制指定：
```bash
npx show-nextjs-routers -f app
```
`-f`または`--force`オプションを使用すると、ルータータイプ（appまたはpages）を強制的に指定できます。自動検出が予想通りに動作しない場合に便利です。

動的ルートパラメータの置換：
```bash
npx show-nextjs-routers -r brand=cola
```
`-r`または`--replace`オプションを使用すると、動的ルートパラメータを実際の値に置き換えることができます。例えば、`-r brand=cola`を使用すると、URLの`:brand`部分が`cola`に置き換えられます。これは特定のルートシナリオをテストするのに役立ちます。

パラメータ置換を使用した結果例：
```
http://localhost:3000
http://localhost:3000/list
http://localhost:3000/cola/sales/item
http://localhost:3000/sample
http://localhost:3000/sample/node
```

ヘルプの表示：
```bash
npx show-nextjs-routers --help
```

## 特徴

- Next.js App Router構造の自動検出
- URLリストまたはツリー形式でのルート可視化
- 動的ルート（[slug] → :slug）変換
- 動的ルートパラメータ置換機能のサポート
- 様々なNext.jsルーティングルールのサポート
- ルートグループ（括弧で囲まれたフォルダ）のサポート

## 要件

- Node.js 15.0.0以上
- Appルーターの使用

## ライセンス

ISC