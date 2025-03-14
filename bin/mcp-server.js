#!/usr/bin/env node
/**
 * @file MCPサーバー起動スクリプト
 * Cursorから実行された場合に環境変数を設定して、自動的にStdioモードで起動するためのスクリプト
 */

// デバッグログ
process.stderr.write('Starting bin/mcp-server.js\n');

// 環境変数を設定
process.env.CURSOR_MCP_CLIENT = 'true';
process.stderr.write(`Set CURSOR_MCP_CLIENT=${process.env.CURSOR_MCP_CLIENT}\n`);

// 引数を渡して本体を実行
process.stderr.write('Requiring ../dist/index.js\n');
require('../dist/index.js'); 
