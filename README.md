# View Control MCP Server

ローカルPCの操作、マウスクリック、画面キャプチャなどを行うMCP（Master Control
Program）サーバー。

## 機能

- マウス操作（移動、クリック、ドラッグ＆ドロップ）
- キーボード操作（キー入力、ショートカットキー）
- 画面キャプチャ
- RESTful API経由での操作

## インストール

```bash
npm install view-control-mcp-server
```

## 使用方法

### サーバーの起動

```typescript
import { MCPServer } from "view-control-mcp-server";

const server = new MCPServer();
server.start(3000); // ポート3000でサーバーを起動
```

### APIの使用例

#### マウス操作

```bash
# マウスを移動
curl -X POST http://localhost:3000/api/mouse/move -H "Content-Type: application/json" -d '{"x": 100, "y": 100}'

# マウスクリック
curl -X POST http://localhost:3000/api/mouse/click -H "Content-Type: application/json" -d '{"button": "left"}'
```

#### キーボード操作

```bash
# キー入力
curl -X POST http://localhost:3000/api/keyboard/type -H "Content-Type: application/json" -d '{"text": "Hello, World!"}'

# ショートカットキー
curl -X POST http://localhost:3000/api/keyboard/shortcut -H "Content-Type: application/json" -d '{"keys": ["command", "c"]}'
```

#### 画面キャプチャ

```bash
# 画面キャプチャを取得
curl -X GET http://localhost:3000/api/screen/capture
```

## 開発

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/view-control-mcp-server.git
cd view-control-mcp-server

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# ビルド
npm run build
```

## ライセンス

MIT
