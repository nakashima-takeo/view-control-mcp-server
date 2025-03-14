/**
 * @file エントリーポイント
 * @index 1. インポート
 * 2. サーバー起動
 */

import { MCPServer } from './server';

// デフォルトエクスポート
export { MCPServer } from './server';
export * from './services/mouse.service';
export * from './services/keyboard.service';
export * from './services/screen.service';

// スタンドアロンモードの場合はサーバーを起動
if (require.main === module) {
  try {
    const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
    const server = new MCPServer();
    
    // MCPサーバーの起動
    console.log(`Starting MCP Server on port ${PORT}...`);
    server.start(PORT);
    
    // シャットダウンハンドラー
    const shutdown = () => {
      console.log('Shutting down MCP Server...');
      server.stop();
      process.exit(0);
    };
    
    // シグナルハンドラーを登録
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // プロセス終了時のエラーハンドリング
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      server.stop();
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.stop();
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start MCP Server:', error);
    process.exit(1);
  }
} 
