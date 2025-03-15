/**
 * @file MCPサーバー実装
 * @index 1. インポート
 * 2. 型定義
 * 3. MCPServerクラス
 * 4. ツール実装
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// サービスのインポート
import type { MouseService } from "./services/mouse.service";
import type { KeyboardService } from "./services/keyboard.service";
import type { ScreenService } from "./services/screen.service";
import type { MouseButton } from "./services/mouse.service";
import type { ModifierKey } from "./services/keyboard.service";

/**
 * MCPサーバーの設定オプション
 */
export interface MCPServerOptions {
  /**
   * サーバー名
   */
  name?: string;

  /**
   * サーバーバージョン
   */
  version?: string;

  /**
   * デバッグモードを有効にするかどうか
   */
  debug?: boolean;
}

/**
 * MCPサーバークラス
 * Model Context Protocol SDKを使用したサーバー実装
 */
export class MCPServer {
  private server: McpServer;
  private mouseService: MouseService;
  private keyboardService: KeyboardService;
  private screenService: ScreenService;
  private debug: boolean;

  /**
   * コンストラクタ
   * @param mouseService マウスサービス
   * @param keyboardService キーボードサービス
   * @param screenService スクリーンサービス
   * @param options サーバーオプション
   */
  constructor(
    mouseService: MouseService,
    keyboardService: KeyboardService,
    screenService: ScreenService,
    options: MCPServerOptions = {}
  ) {
    this.mouseService = mouseService;
    this.keyboardService = keyboardService;
    this.screenService = screenService;
    this.debug = options.debug || false;

    // MCPサーバーの初期化
    this.server = new McpServer({
      name: options.name || "View Control MCP Server",
      version: options.version || "1.0.0"
    });

    // ツールの登録
    this.registerTools();

    this.log("MCPサーバーが初期化されました");
  }

  /**
   * ログを出力する
   * @param message ログメッセージ
   */
  private log(message: string): void {
    console.error(`[MCP Server] ${message}`);
  }

  /**
   * デバッグログを出力する
   * @param message ログメッセージ
   */
  private debug_log(message: string): void {
    if (this.debug) {
      console.error(`[MCP Server Debug] ${message}`);
    }
  }

  /**
   * ツールを登録する
   */
  private registerTools() {
    // 1. マウス位置取得ツール
    this.server.tool(
      "get_mouse_position",
      {}, // パラメータなし
      async () => {
        try {
          this.debug_log("マウス位置取得ツールが呼び出されました");
          const position = this.mouseService.getPosition();
          this.debug_log(`現在のマウス位置: x=${position.x}, y=${position.y}`);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ position })
            }]
          };
        } catch (error) {
          this.log(`マウス位置取得エラー: ${error}`);
          throw error;
        }
      }
    );

    // 2. マウス移動ツール
    this.server.tool(
      "move_mouse",
      {
        x: z.number().describe("移動先のX座標"),
        y: z.number().describe("移動先のY座標")
      },
      async ({ x, y }) => {
        try {
          this.debug_log(`マウス移動ツールが呼び出されました: x=${x}, y=${y}`);
          this.mouseService.move(x, y);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, x, y })
            }]
          };
        } catch (error) {
          this.log(`マウス移動エラー: ${error}`);
          throw error;
        }
      }
    );

    // 3. マウスクリックツール
    this.server.tool(
      "click_mouse",
      {
        button: z.enum(["left", "right", "middle"]).default("left").describe("クリックするボタン"),
        double: z.boolean().default(false).describe("ダブルクリックかどうか")
      },
      async ({ button, double }) => {
        try {
          this.debug_log(`マウスクリックツールが呼び出されました: button=${button}, double=${double}`);
          this.mouseService.click(button as MouseButton, double);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, button, double })
            }]
          };
        } catch (error) {
          this.log(`マウスクリックエラー: ${error}`);
          throw error;
        }
      }
    );

    // 4. テキスト入力ツール
    this.server.tool(
      "type_text",
      {
        text: z.string().describe("入力するテキスト")
      },
      async ({ text }) => {
        try {
          this.debug_log(`テキスト入力ツールが呼び出されました: text=${text}`);
          this.keyboardService.type(text);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, length: text.length })
            }]
          };
        } catch (error) {
          this.log(`テキスト入力エラー: ${error}`);
          throw error;
        }
      }
    );

    // 5. キー押下ツール
    this.server.tool(
      "press_key",
      {
        key: z.string().describe("押下するキー"),
        modifiers: z.array(
          z.enum(["command", "alt", "control", "shift", "fn"])
        ).optional().default([]).describe("修飾キー")
      },
      async ({ key, modifiers }) => {
        try {
          this.debug_log(`キー押下ツールが呼び出されました: key=${key}, modifiers=${modifiers.join(',')}`);
          this.keyboardService.pressKey(key, modifiers as ModifierKey[]);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, key, modifiers })
            }]
          };
        } catch (error) {
          this.log(`キー押下エラー: ${error}`);
          throw error;
        }
      }
    );

    // 6. スクリーンキャプチャツール
    this.server.tool(
      "capture_screen",
      {}, // パラメータなし
      async () => {
        try {
          this.debug_log("スクリーンキャプチャツールが呼び出されました");
          const screenshot = await this.screenService.capture();
          this.debug_log(`スクリーンキャプチャ完了: ${screenshot.length} bytes`);
          return {
            content: [{
              type: "image",
              data: screenshot.toString('base64'),
              mimeType: "image/png"
            }]
          };
        } catch (error) {
          this.log(`スクリーンキャプチャエラー: ${error}`);
          throw error;
        }
      }
    );

    // 7. ドラッグ＆ドロップツール
    this.server.tool(
      "drag_and_drop",
      {
        startX: z.number().describe("開始X座標"),
        startY: z.number().describe("開始Y座標"),
        endX: z.number().describe("終了X座標"),
        endY: z.number().describe("終了Y座標"),
        button: z.enum(["left", "right", "middle"]).default("left").describe("使用するボタン")
      },
      async ({ startX, startY, endX, endY, button }) => {
        try {
          this.debug_log(`ドラッグ＆ドロップツールが呼び出されました: startX=${startX}, startY=${startY}, endX=${endX}, endY=${endY}, button=${button}`);
          this.mouseService.dragAndDrop(startX, startY, endX, endY, button as MouseButton);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, startX, startY, endX, endY, button })
            }]
          };
        } catch (error) {
          this.log(`ドラッグ＆ドロップエラー: ${error}`);
          throw error;
        }
      }
    );

    // 8. キーボードショートカットツール
    this.server.tool(
      "keyboard_shortcut",
      {
        keys: z.array(z.string()).min(1).describe("キーの配列（最後の要素がメインキー、それ以外は修飾キー）")
      },
      async ({ keys }) => {
        try {
          this.debug_log(`キーボードショートカットツールが呼び出されました: keys=${keys.join('+')}`);
          this.keyboardService.shortcut(keys);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ success: true, keys })
            }]
          };
        } catch (error) {
          this.log(`キーボードショートカットエラー: ${error}`);
          throw error;
        }
      }
    );

    this.log("全てのツールが登録されました");
  }

  /**
   * サーバーを起動する
   */
  async start() {
    try {
      const transport = new StdioServerTransport();
      this.log("MCPサーバーを起動しています...");
      await this.server.connect(transport);
      this.log("MCPサーバーが起動しました");
    } catch (error) {
      this.log(`サーバー起動エラー: ${error}`);
      throw error;
    }
  }
}
