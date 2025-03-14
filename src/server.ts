/**
 * @file MCPサーバークラス
 * @index 1. インポート
 * 2. サーバークラス
 */

import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { MCPProtocolHandler } from './mcp-protocol';
import { MouseService, type MouseButton } from './services/mouse.service';
import { KeyboardService, type ModifierKey } from './services/keyboard.service';
import { ScreenService } from './services/screen.service';

/**
 * MCP（Model Context Protocol）サーバークラス
 * ローカルPCの操作、マウスクリック、画面キャプチャなどを行うためのサーバー
 */
export class MCPServer {
  private app: Express;
  private server: ReturnType<Express['listen']> | null;
  private mcpHandler: MCPProtocolHandler;
  private mouseService: MouseService;
  private keyboardService: KeyboardService;
  private screenService: ScreenService;

  /**
   * コンストラクタ
   */
  constructor() {
    this.app = express();
    this.server = null;
    this.mcpHandler = new MCPProtocolHandler();
    this.mouseService = new MouseService();
    this.keyboardService = new KeyboardService();
    this.screenService = new ScreenService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupMCPMethods();
  }

  /**
   * ミドルウェアの設定
   */
  private setupMiddleware(): void {
    // JSONボディパーサー
    this.app.use(express.json());

    // CORSヘッダー
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }

      next();
    });
  }

  /**
   * ルートの設定
   */
  private setupRoutes(): void {
    // MCPプロトコルエンドポイント
    this.app.post('/mcp', (req, res) => {
      this.mcpHandler.handleRequest(req, res);
    });

    // ルートパス
    this.app.get('/', (req, res) => {
      res.json({
        name: 'MCP Server',
        description: 'Model Context Protocol Server for local PC control',
        version: '1.0.1',
        endpoints: {
          mcp: '/mcp'
        }
      });
    });

    // 404ハンドラー
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
  }

  /**
   * MCPメソッドの設定
   */
  private setupMCPMethods(): void {
    // マウス関連メソッド
    this.mcpHandler.registerMethod('mouse.getPosition', async () => {
      return this.mouseService.getPosition();
    });

    this.mcpHandler.registerMethod('mouse.move', async (params) => {
      const { x, y } = params as { x: number; y: number };
      this.mouseService.move(x, y);
      return { success: true };
    });

    this.mcpHandler.registerMethod('mouse.click', async (params) => {
      const { button = 'left' } = params as { button?: MouseButton };
      this.mouseService.click(button);
      return { success: true };
    });

    // キーボード関連メソッド
    this.mcpHandler.registerMethod('keyboard.type', async (params) => {
      const { text } = params as { text: string };
      this.keyboardService.type(text);
      return { success: true };
    });

    this.mcpHandler.registerMethod('keyboard.press', async (params) => {
      const { key, modifiers = [] } = params as {
        key: string;
        modifiers?: ModifierKey[]
      };
      this.keyboardService.pressKey(key, modifiers);
      return { success: true };
    });

    // スクリーン関連メソッド
    this.mcpHandler.registerMethod('screen.capture', async () => {
      const screenshot = await this.screenService.capture();
      return { image: screenshot.toString('base64') };
    });

    // サーバー情報メソッド
    this.mcpHandler.registerMethod('server.info', async () => {
      return {
        name: 'MCP Server',
        description: 'Model Context Protocol Server for local PC control',
        version: '1.0.1',
        capabilities: ['mouse', 'keyboard', 'screen']
      };
    });
  }

  /**
   * サーバーを起動する
   * @param port ポート番号
   * @returns サーバーインスタンス
   */
  start(port = 3000): ReturnType<Express['listen']> {
    this.server = this.app.listen(port, () => {
      console.log(`MCP Server is running on port ${port}`);
    });

    return this.server;
  }

  /**
   * サーバーを停止する
   */
  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log('MCP Server has been stopped');
    }
  }
}
