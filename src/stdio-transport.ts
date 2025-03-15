/**
 * @file Stdioトランスポート実装
 * @index 1. インポート
 * 2. 型定義
 * 3. Stdioトランスポートハンドラー
 */

import type { ReadLine } from 'node:readline';
import type { MCPProtocolHandler } from './mcp-protocol';
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

    // デバッグログ
    logToStderr(`stdin isRaw: ${Boolean(process.stdin.isRaw)}`);
    logToStderr(`stdin isTTY: ${Boolean(process.stdin.isTTY)}`);

    // 標準入力からのリクエストを処理
    this.rl.on('line', async (line) => {
      logToStderr(`Received line: ${line}`);
      try {
        // 空行は無視
        if (!line.trim()) {
          logToStderr('Empty line, ignoring');
          return;
        }

        // JSONをパース
        const request = JSON.parse(line);
        logToStderr(`Parsed request: ${JSON.stringify(request, null, 2)}`);

        // リクエストを処理して結果を標準出力に書き込む
        const response = await this.processRequest(request);

        // 通知の場合はレスポンスを返さない
        if (response === null) {
          logToStderr('Notification request, no response sent');
          return;
        }

        logToStderr(`Sending response: ${JSON.stringify(response, null, 2)}`);
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
        logToStderr(`Sending error response: ${JSON.stringify(errorResponse, null, 2)}`);
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
  private async processRequest(req: { jsonrpc?: string; id?: string | number; method?: string; params?: unknown }): Promise<unknown> {
    try {
      // リクエストのバリデーション
      if (!req.jsonrpc || req.jsonrpc !== '2.0') {
        return {
          jsonrpc: '2.0',
          id: req.id ?? null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc version must be 2.0'
          }
        };
      }

      if (!req.method) {
        return {
          jsonrpc: '2.0',
          id: req.id ?? null,
          error: {
            code: -32600,
            message: 'Invalid Request: method is required'
          }
        };
      }

      // メソッド存在チェック
      if (!this.mcpHandler.hasMethod(req.method)) {
        return {
          jsonrpc: '2.0',
          id: req.id ?? null,
          error: {
            code: -32601,
            message: `Method not found: ${req.method}`
          }
        };
      }

      // 通知（idなし）の場合の処理
      const isNotification = req.id === undefined;
      if (isNotification) {
        logToStderr(`Processing notification: ${req.method}`);
        try {
          await this.mcpHandler.callMethod(req.method, req.params);
          // 通知の場合はレスポンスを返さない
          return null;
        } catch (error) {
          logToStderr(`Error processing notification ${req.method}: ${error}`);
          // 通知の場合でもエラーはログに記録するが、レスポンスは返さない
          return null;
        }
      }

      // 通常のリクエスト処理
      logToStderr(`Processing request: ${req.method} (id: ${req.id})`);
      try {
        const result = await this.mcpHandler.callMethod(req.method, req.params);
        // JSON-RPC 2.0に準拠したレスポンス
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: result
        };
      } catch (error) {
        logToStderr(`Error processing request ${req.method}: ${error}`);
        // エラーレスポンス
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal error'
          }
        };
      }
    } catch (error) {
      logToStderr(`Unexpected error in processRequest: ${error}`);
      return {
        jsonrpc: '2.0',
        id: req.id ?? null,
        error: {
          code: -32603,
          message: 'Internal error'
        }
      };
    }
  }
}
