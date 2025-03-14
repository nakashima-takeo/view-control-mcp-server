/**
 * @file MCPサーバークラス
 * @index 1. インポート
 * 2. サーバークラス
 */

import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import apiRoutes from './routes';

/**
 * MCP（Master Control Program）サーバークラス
 * ローカルPCの操作、マウスクリック、画面キャプチャなどを行うためのサーバー
 */
export class MCPServer {
  private app: Express;
  private server: ReturnType<Express['listen']> | null;

  /**
   * コンストラクタ
   */
  constructor() {
    this.app = express();
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
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
    // APIルートをマウント
    this.app.use('/api', apiRoutes);
    
    // ルートパス
    this.app.get('/', (req, res) => {
      res.json({
        name: 'MCP Server',
        description: 'Master Control Program Server for local PC control',
        version: '1.0.0',
        endpoints: {
          mouse: '/api/mouse',
          keyboard: '/api/keyboard',
          screen: '/api/screen'
        }
      });
    });
    
    // 404ハンドラー
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
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
