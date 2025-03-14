/**
 * @file MCPプロトコル実装
 * @index 1. インポート
 * 2. 型定義
 * 3. MCPプロトコルハンドラー
 */

import type { Request, Response } from 'express';

// MCPリクエスト型定義
interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: unknown;
}

// MCPレスポンス型定義
interface MCPResponse {
  jsonrpc: string;
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * MCPプロトコルハンドラークラス
 */
export class MCPProtocolHandler {
  private methods: Record<string, (params: unknown) => Promise<unknown>> = {};

  /**
   * メソッドを登録する
   * @param method メソッド名
   * @param handler ハンドラー関数
   */
  registerMethod(method: string, handler: (params: unknown) => Promise<unknown>): void {
    this.methods[method] = handler;
  }

  /**
   * メソッドが存在するかチェックする
   * @param method メソッド名
   * @returns メソッドが存在するかどうか
   */
  hasMethod(method: string): boolean {
    return !!this.methods[method];
  }

  /**
   * メソッドを呼び出す
   * @param method メソッド名
   * @param params パラメータ
   * @returns メソッドの実行結果
   */
  async callMethod(method: string, params?: unknown): Promise<unknown> {
    if (!this.hasMethod(method)) {
      throw new Error(`Method not found: ${method}`);
    }
    return await this.methods[method](params);
  }

  /**
   * MCPリクエストを処理する
   * @param req Expressリクエスト
   * @param res Expressレスポンス
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const mcpRequest = req.body as MCPRequest;

      // JSONRPCバージョンチェック
      if (mcpRequest.jsonrpc !== '2.0') {
        this.sendErrorResponse(res, mcpRequest.id, -32600, 'Invalid Request: jsonrpc must be 2.0');
        return;
      }

      // メソッド存在チェック
      if (!this.hasMethod(mcpRequest.method)) {
        this.sendErrorResponse(res, mcpRequest.id, -32601, `Method not found: ${mcpRequest.method}`);
        return;
      }

      try {
        // メソッド実行
        const result = await this.callMethod(mcpRequest.method, mcpRequest.params);

        // 成功レスポンス送信
        this.sendSuccessResponse(res, mcpRequest.id, result);
      } catch (error) {
        // メソッド実行エラー
        this.sendErrorResponse(
          res,
          mcpRequest.id,
          -32000,
          error instanceof Error ? error.message : 'Unknown error',
          error
        );
      }
    } catch (error) {
      // パース失敗などの一般エラー
      this.sendErrorResponse(res, null, -32700, 'Parse error', error);
    }
  }

  /**
   * 成功レスポンスを送信する
   * @param res Expressレスポンス
   * @param id リクエストID
   * @param result 結果
   */
  private sendSuccessResponse(res: Response, id: string | number, result: unknown): void {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id,
      result
    };

    res.json(response);
  }

  /**
   * エラーレスポンスを送信する
   * @param res Expressレスポンス
   * @param id リクエストID
   * @param code エラーコード
   * @param message エラーメッセージ
   * @param data 追加データ
   */
  private sendErrorResponse(
    res: Response,
    id: string | number | null,
    code: number,
    message: string,
    data?: unknown
  ): void {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id: id ?? null,
      error: {
        code,
        message,
        data
      }
    };

    res.status(code >= -32099 && code <= -32000 ? 500 : 400).json(response);
  }
}
