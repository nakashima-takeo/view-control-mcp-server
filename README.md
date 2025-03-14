# View Control MCP Server

ローカルPCの操作、マウスクリック、画面キャプチャなどを行うModel Context Protocol
(MCP)サーバー。

## Model Context Protocol (MCP)とは

Model Context Protocol
(MCP)は、AI言語モデルアプリケーション（クライアント）と外部サービス（サーバー）間の標準化された通信プロトコルです。MCPを使用することで、AIアシスタントがローカルPCの操作やデータ取得などの機能を利用できるようになります。

このサーバーは、JSON-RPC 2.0に準拠したMCPプロトコルを実装しており、Claude
DesktopやCursorなどのMCPクライアントと連携できます。

## 機能

- **マウス操作**
  - マウス位置の取得
  - マウスの移動
  - マウスクリック（左/右/中ボタン）
  - ドラッグ＆ドロップ

- **キーボード操作**
  - テキスト入力
  - キー押下
  - 修飾キー（Command, Alt, Control, Shift）との組み合わせ

- **画面キャプチャ**
  - 画面全体のキャプチャ
  - Base64エンコードされた画像データの取得

- **通信方式**
  - JSON-RPC 2.0準拠のMCPプロトコル
  - Stdioトランスポート（標準入出力）

## インストール

```bash
npm install view-control-mcp-server
```

## 使用方法

### サーバーの起動

#### コマンドラインから起動

```bash
# Stdioモードで起動（Cursor等のMCPクライアントと直接連携する場合）
npx view-control-mcp-server
```

### MCPプロトコルでの通信

MCPサーバーはJSON-RPC 2.0形式のリクエストを標準入出力を通じて受け付けます。

#### リクエスト形式

```json
{
  "jsonrpc": "2.0",
  "id": "任意のID",
  "method": "メソッド名",
  "params": {/* パラメータ */}
}
```

#### 成功レスポンス形式

```json
{
  "jsonrpc": "2.0",
  "id": "リクエストと同じID",
  "result": {/* 結果 */}
}
```

#### エラーレスポンス形式

```json
{
  "jsonrpc": "2.0",
  "id": "リクエストと同じID",
  "error": {
    "code": エラーコード,
    "message": "エラーメッセージ",
    "data": { /* 追加情報 */ }
  }
}
```

### 利用可能なMCPメソッド

#### マウス関連

- `mouse.getPosition`: マウス位置取得
  ```json
  { "jsonrpc": "2.0", "id": 1, "method": "mouse.getPosition" }
  ```

- `mouse.move`: マウス移動
  ```json
  {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "mouse.move",
    "params": { "x": 100, "y": 100 }
  }
  ```

- `mouse.click`: マウスクリック
  ```json
  {
    "jsonrpc": "2.0",
    "id": 3,
    "method": "mouse.click",
    "params": { "button": "left" }
  }
  ```

#### キーボード関連

- `keyboard.type`: テキスト入力
  ```json
  {
    "jsonrpc": "2.0",
    "id": 4,
    "method": "keyboard.type",
    "params": { "text": "Hello, World!" }
  }
  ```

- `keyboard.press`: キー押下
  ```json
  {
    "jsonrpc": "2.0",
    "id": 5,
    "method": "keyboard.press",
    "params": { "key": "a", "modifiers": ["command"] }
  }
  ```

#### スクリーン関連

- `screen.capture`: スクリーンキャプチャ
  ```json
  { "jsonrpc": "2.0", "id": 6, "method": "screen.capture" }
  ```

#### サーバー情報

- `server.info`: サーバー情報取得
  ```json
  { "jsonrpc": "2.0", "id": 7, "method": "server.info" }
  ```

## MCPクライアントとの連携

このサーバーは、Claude DesktopやCursorなどのMCPクライアントと連携できます。

### Cursorとの連携

1. Cursorを起動し、設定を開きます
2. MCP設定セクションで「Add Server」をクリックします
3. 以下のように設定します：
   - **Name**: View Control MCP Server
   - **Transport**: stdio
   - **Command**: npx view-control-mcp-server
   - **Args**: （空欄でOK - 自動的にStdioモードで起動します）
4. 「Add」をクリックして保存します
5. Cursorの拡張機能として利用できるようになります

### Claude Desktopとの連携

1. Claude Desktopを起動し、設定を開きます
2. MCP設定セクションで「Add Server」をクリックします
3. 以下のように設定します：
   - **Name**: View Control MCP Server
   - **Transport**: stdio
   - **Command**: npx view-control-mcp-server
   - **Args**: （空欄でOK - 自動的にStdioモードで起動します）
4. 「Add」をクリックして保存します
5. Claudeの拡張機能として利用できるようになります

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

## 注意事項

- このサーバーはローカルPCを操作するため、セキュリティに注意してください。
- 信頼できるネットワーク内でのみ使用することをお勧めします。
- 画面キャプチャ機能は、プライバシーに配慮して使用してください。

## ライセンス

MIT
