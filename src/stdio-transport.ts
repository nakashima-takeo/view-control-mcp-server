/**
 * @file Stdioトランスポート実装
 * @index 1. インポート
 * 2. 型定義
 * 3. Stdioトランスポートハンドラー
 */

import type { ReadLine } from 'node:readline';
import { MCPProtocolHandler } from './mcp-protocol';
import * as readline from 'node:readline';

/**
 * stderrにログを出力する
 * @param message ログメッセージ
 */
function logToStderr(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * Stdioトランスポートハンドラークラス
 * 標準入出力を使用してMCPプロトコルを処理する
 */
export class StdioTransportHandler {
  private mcpHandler: MCPProtocolHandler;
  private rl: ReadLine;

  /**
   * コンストラクタ
   * @param mcpHandler MCPプロトコルハンドラー
   */
  constructor(mcpHandler: MCPProtocolHandler) {
    this.mcpHandler = mcpHandler;
    this.rl = readline.createInterface({
      input: process.stdin,
      terminal: false
    });
  }

  /**
   * Stdioトランスポートを開始する
   */
  start(): void {
    logToStderr('Starting MCP Stdio transport...');

    // 標準入力からのリクエストを処理
    this.rl.on('line', async (line) => {
      try {
        // 空行は無視
        if (!line.trim()) {
          return;
        }

        // JSONをパース
        const request = JSON.parse(line);
        
        // リクエストを処理して結果を標準出力に書き込む
        const response = await this.processRequest(request);
        process.stdout.write(`${JSON.stringify(response)}\n`);
      } catch (error) {
        // エラーレスポンスを標準出力に書き込む
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        process.stdout.write(`${JSON.stringify(errorResponse)}\n`);
        
        // エラーログをstderrに出力
        logToStderr(`Error processing request: ${error}`);
      }
    });

    // 標準入力が閉じられたら終了
    this.rl.on('close', () => {
      logToStderr('Stdio transport closed');
      process.exit(0);
    });
  }

  /**
   * リクエストを処理する
   * @param request MCPリクエスト
   * @returns MCPレスポンス
   */
  private async processRequest(request: unknown): Promise<unknown> {
    const req = request as { jsonrpc?: string; id?: string | number; method?: string; params?: unknown };
    
    // JSONRPCバージョンチェック
    if (req.jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        id: req.id ?? null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be 2.0'
        }
      };
    }

    // メソッド存在チェック
    if (!req.method || !this.mcpHandler.hasMethod(req.method)) {
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: {
          code: -32601,
          message: `Method not found: ${req.method}`
        }
      };
    }

    try {
      // メソッド実行
      const result = await this.mcpHandler.callMethod(req.method, req.params);
      
      // 成功レスポンス
      return {
        jsonrpc: '2.0',
        id: req.id,
        result
      };
    } catch (error) {
      // メソッド実行エラー
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: error
        }
      };
    }
  }
} 
