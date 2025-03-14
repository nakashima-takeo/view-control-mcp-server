#!/usr/bin/env node
/**
 * @file エントリーポイント
 * @index 1. インポート
 * 2. サーバー起動
 */

import { MCPServer } from './server';
import { MCPProtocolHandler } from './mcp-protocol';
import { StdioTransportHandler } from './stdio-transport';
import { MouseService } from './services/mouse.service';
import { KeyboardService } from './services/keyboard.service';
import { ScreenService } from './services/screen.service';

// デフォルトエクスポート
export { MCPServer } from './server';
export * from './services/mouse.service';
export * from './services/keyboard.service';
export * from './services/screen.service';

/**
 * stderrにログを出力する
 * @param message ログメッセージ
 */
function logToStderr(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * MCPメソッドを設定する
 * @param mcpHandler MCPプロトコルハンドラー
 * @param mouseService マウスサービス
 * @param keyboardService キーボードサービス
 * @param screenService スクリーンサービス
 */
function setupMCPMethods(
  mcpHandler: MCPProtocolHandler,
  mouseService: MouseService,
  keyboardService: KeyboardService,
  screenService: ScreenService
): void {
  // マウス関連メソッド
  mcpHandler.registerMethod('mouse.getPosition', async () => {
    return mouseService.getPosition();
  });

  mcpHandler.registerMethod('mouse.move', async (params) => {
    const { x, y } = params as { x: number; y: number };
    mouseService.move(x, y);
    return { success: true };
  });

  mcpHandler.registerMethod('mouse.click', async (params) => {
    const { button = 'left' } = params as { button?: 'left' | 'right' | 'middle' };
    mouseService.click(button);
    return { success: true };
  });

  // キーボード関連メソッド
  mcpHandler.registerMethod('keyboard.type', async (params) => {
    const { text } = params as { text: string };
    keyboardService.type(text);
    return { success: true };
  });

  mcpHandler.registerMethod('keyboard.press', async (params) => {
    const { key, modifiers = [] } = params as {
      key: string;
      modifiers?: ('command' | 'alt' | 'control' | 'shift' | 'fn')[]
    };
    keyboardService.pressKey(key, modifiers);
    return { success: true };
  });

  // スクリーン関連メソッド
  mcpHandler.registerMethod('screen.capture', async () => {
    const screenshot = await screenService.capture();
    return { image: screenshot.toString('base64') };
  });

  // サーバー情報メソッド
  mcpHandler.registerMethod('server.info', async () => {
    return {
      name: 'MCP Server',
      description: 'Model Context Protocol Server for local PC control',
      version: '1.0.1',
      capabilities: ['mouse', 'keyboard', 'screen']
    };
  });
}

// スタンドアロンモードの場合はサーバーを起動
if (require.main === module) {
  try {
    // 環境変数からトランスポートモードを取得（デフォルトはHTTP）
    const TRANSPORT_MODE = process.env.TRANSPORT_MODE || 'http';
    
    if (TRANSPORT_MODE === 'stdio') {
      // Stdioトランスポートモード
      logToStderr('Starting MCP Server in stdio transport mode...');
      
      // サービスの初期化
      const mouseService = new MouseService();
      const keyboardService = new KeyboardService();
      const screenService = new ScreenService();
      
      // MCPハンドラーの初期化
      const mcpHandler = new MCPProtocolHandler();
      
      // MCPメソッドの設定
      setupMCPMethods(mcpHandler, mouseService, keyboardService, screenService);
      
      // Stdioトランスポートの初期化と開始
      const stdioTransport = new StdioTransportHandler(mcpHandler);
      stdioTransport.start();
    } else {
      // HTTPトランスポートモード（従来のサーバー）
      const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
      const server = new MCPServer();

      // MCPサーバーの起動（stderrにログ出力）
      logToStderr(`Starting MCP Server in HTTP transport mode on port ${PORT}...`);
      logToStderr(`MCP endpoint available at: http://localhost:${PORT}/mcp`);
      server.start(PORT);

      // シャットダウンハンドラー
      const shutdown = () => {
        logToStderr('Shutting down MCP Server...');
        server.stop();
        process.exit(0);
      };

      // シグナルハンドラーを登録
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    }

    // プロセス終了時のエラーハンドリング
    process.on('uncaughtException', (error) => {
      logToStderr(`Uncaught Exception: ${error}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logToStderr(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });
  } catch (error) {
    logToStderr(`Failed to start MCP Server: ${error}`);
    process.exit(1);
  }
}
