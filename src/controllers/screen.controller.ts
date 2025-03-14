/**
 * @file 画面キャプチャコントローラー
 * @index 1. インポート
 * 2. コントローラークラス
 */

import type { Request, Response } from 'express';
import type { ScreenService } from '../services/screen.service';
import path from 'node:path';
import os from 'node:os';

/**
 * 画面キャプチャのAPIエンドポイントを提供するコントローラークラス
 */
export class ScreenController {
  /**
   * コンストラクタ
   * @param screenService 画面キャプチャサービス
   */
  constructor(private screenService: ScreenService) {}

  /**
   * 画面キャプチャを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async capture(req: Request, res: Response): Promise<void> {
    try {
      const imageBuffer = await this.screenService.capture();
      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      res.status(500).json({ error: `キャプチャの取得に失敗しました: ${errorMessage}` });
    }
  }

  /**
   * 画面キャプチャを取得して保存する
   * @param req リクエスト
   * @param res レスポンス
   */
  async captureAndSave(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.body;
      
      // ファイル名が指定されていない場合はタイムスタンプを使用
      const outputFilename = filename || `screenshot_${Date.now()}.png`;
      
      // 一時ディレクトリにファイルを保存
      const outputPath = path.join(os.tmpdir(), outputFilename);
      
      await this.screenService.captureAndSave(outputPath);
      
      res.json({ success: true, path: outputPath });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      res.status(500).json({ error: `キャプチャの保存に失敗しました: ${errorMessage}` });
    }
  }
} 
