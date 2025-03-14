/**
 * @file MCPプロトコル実装
 * @index 1. インポート
 * 2. 型定義
 * 3. MCPプロトコルハンドラー
 */

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

// ツール定義型
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCPプロトコルハンドラークラス
 */
export class MCPProtocolHandler {
  private methods: Record<string, (params: unknown) => Promise<unknown>> = {};
  private tools: Tool[] = [];

  /**
   * メソッドを登録する
   * @param method メソッド名
   * @param handler ハンドラー関数
   */
  registerMethod(method: string, handler: (params: unknown) => Promise<unknown>): void {
    this.methods[method] = handler;
  }

  /**
   * ツールを登録する
   * @param tool ツール定義
   * @param handler ハンドラー関数
   */
  registerTool(tool: Tool, handler: (params: unknown) => Promise<unknown>): void {
    this.tools.push(tool);
    this.methods[`tools/call/${tool.name}`] = handler;
  }

  /**
   * 登録されているツールのリストを取得する
   * @returns ツールのリスト
   */
  getTools(): Tool[] {
    return [...this.tools]; // 配列のコピーを返す
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
}
