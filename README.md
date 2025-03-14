# View Control MCP Server

ローカルPCの操作、マウスクリック、画面キャプチャなどを行うModel Context Protocol
(MCP)サーバー。

## Model Context Protocol (MCP)とは

Model Context Protocol
(MCP)は、AI言語モデルアプリケーション（クライアント）と外部サービス（サーバー）間の標準化された通信プロトコルです。MCPを使用することで、AIアシスタントがローカルPCの操作やデータ取得などの機能を利用できるようになります。

このサーバーは、JSON-RPC 2.0に準拠したMCPプロトコルを実装しており、Claude
DesktopやCursorなどのMCPクライアントと連携できます。サポートしているMCPプロトコルバージョンは`2024-11-05`です。

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

#### 通知形式（レスポンスなし）

```json
{
  "jsonrpc": "2.0",
  "method": "通知メソッド名",
  "params": {/* パラメータ */}
}
```

### 利用可能なMCPメソッド

#### 基本メソッド

- `initialize`: サーバーの初期化
  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "MCP Client",
        "version": "1.0.0"
      }
    }
  }
  ```

- `ping`: サーバーの生存確認
  ```json
  { "jsonrpc": "2.0", "id": 2, "method": "ping" }
  ```

- `listOfferings`: サーバーが提供する機能一覧の取得
  ```json
  { "jsonrpc": "2.0", "id": 3, "method": "listOfferings" }
  ```

#### ツール関連

- `tools/list`: 利用可能なツール一覧の取得
  ```json
  { "jsonrpc": "2.0", "id": 4, "method": "tools/list" }
  ```
  レスポンス:
  ```json
  {
    "jsonrpc": "2.0",
    "id": 4,
    "result": {
      "tools": [/* ツール一覧 */],
      "nextCursor": "" // ページネーションを使用しない場合は空文字列
    }
  }
  ```

- `tools/call`: ツールの呼び出し
  ```json
  {
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "ツール名",
      "arguments": {/* 引数 */}
    }
  }
  ```
  レスポンス:
  ```json
  {
    "jsonrpc": "2.0",
    "id": 5,
    "result": {
      "content": [
        {
          "type": "text",
          "text": "結果のJSON文字列"
        }
      ],
      "isError": false
    }
  }
  ```

#### マウス関連

- `mouse.getPosition`: マウス位置取得
  ```json
  { "jsonrpc": "2.0", "id": 6, "method": "mouse.getPosition" }
  ```

- `mouse.move`: マウス移動
  ```json
  {
    "jsonrpc": "2.0",
    "id": 7,
    "method": "mouse.move",
    "params": { "x": 100, "y": 100 }
  }
  ```

- `mouse.click`: マウスクリック
  ```json
  {
    "jsonrpc": "2.0",
    "id": 8,
    "method": "mouse.click",
    "params": { "button": "left" }
  }
  ```

#### キーボード関連

- `keyboard.type`: テキスト入力
  ```json
  {
    "jsonrpc": "2.0",
    "id": 9,
    "method": "keyboard.type",
    "params": { "text": "Hello, World!" }
  }
  ```

- `keyboard.press`: キー押下
  ```json
  {
    "jsonrpc": "2.0",
    "id": 10,
    "method": "keyboard.press",
    "params": { "key": "a", "modifiers": ["command"] }
  }
  ```

#### スクリーン関連

- `screen.capture`: スクリーンキャプチャ
  ```json
  { "jsonrpc": "2.0", "id": 11, "method": "screen.capture" }
  ```

#### サーバー情報

- `server.info`: サーバー情報取得
  ```json
  { "jsonrpc": "2.0", "id": 12, "method": "server.info" }
  ```

### 通知

- `notifications/initialized`: クライアントの初期化完了通知
  ```json
  {
    "jsonrpc": "2.0",
    "method": "notifications/initialized"
  }
  ```
  この通知に対してはレスポンスを返しません。

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

## デバッグ

MCPサーバーの動作をデバッグするには、MCPインスペクターを使用することをお勧めします。MCPインスペクターを使用すると、サーバーとクライアント間のメッセージ交換を可視化できます。

```bash
# MCPインスペクターのインストール
npm install -g @anthropic/mcp-inspector

# MCPインスペクターの起動
mcp-inspector
```

ブラウザで`http://localhost:5173`を開き、MCPインスペクターのUIを使用してサーバーとの通信をテストできます。

## 注意事項

- このサーバーはローカルPCを操作するため、セキュリティに注意してください。
- 信頼できるネットワーク内でのみ使用することをお勧めします。
- 画面キャプチャ機能は、プライバシーに配慮して使用してください。

## ライセンス

MIT
