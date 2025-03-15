#!/usr/bin/env node
/**
 * @file MCPサーバーエントリーポイント
 * @index 1. インポート
 * 2. ユーティリティ関数
 * 3. メイン処理
 */

import { MCPServer } from './mcp-server';
import { MouseService } from './services/mouse.service';
import { KeyboardService } from './services/keyboard.service';
import { ScreenService } from './services/screen.service';

/**
 * 標準エラー出力にログを出力する
 * @param message ログメッセージ
 */
function logToStderr(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * コマンドライン引数を解析する
 * @returns オプションオブジェクト
 */
function parseArgs(): { debug: boolean } {
  const args = process.argv.slice(2);
  return {
    debug: args.includes('--debug') || args.includes('-d')
  };
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  // コマンドライン引数の解析
  const options = parseArgs();

  logToStderr('Starting View Control MCP Server...');
  if (options.debug) {
    logToStderr('デバッグモードが有効です');
  }

  // サービスの初期化
  const mouseService = new MouseService();
  const keyboardService = new KeyboardService();
  const screenService = new ScreenService();

  // MCPサーバーの初期化
  const mcpServer = new MCPServer(
    mouseService,
    keyboardService,
    screenService,
    {
      debug: options.debug
    }
  );

  // サーバーを起動
  try {
    await mcpServer.start();
  } catch (err) {
    logToStderr(`サーバー起動エラー: ${err}`);
    process.exit(1);
  }
}

// メイン処理を実行
main().catch(err => {
  logToStderr(`予期せぬエラー: ${err}`);
  process.exit(1);
});
