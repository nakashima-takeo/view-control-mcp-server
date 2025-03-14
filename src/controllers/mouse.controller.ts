/**
 * @file マウスコントローラー
 * @index 1. インポート
 * 2. コントローラークラス
 */

import type { Request, Response } from 'express';
import type { MouseService, MouseButton } from '../services/mouse.service';

/**
 * マウス操作のAPIエンドポイントを提供するコントローラークラス
 */
export class MouseController {
  /**
   * コンストラクタ
   * @param mouseService マウスサービス
   */
  constructor(private mouseService: MouseService) {}

  /**
   * マウスの現在位置を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  getPosition(req: Request, res: Response): void {
    const position = this.mouseService.getPosition();
    res.json(position);
  }

  /**
   * マウスを移動する
   * @param req リクエスト
   * @param res レスポンス
   */
  move(req: Request, res: Response): void {
    const { x, y } = req.body;

    // 入力値の検証
    if (typeof x !== 'number' || typeof y !== 'number') {
      res.status(400).json({ error: '不正なリクエスト: x と y は数値である必要があります' });
      return;
    }

    this.mouseService.move(x, y);
    res.json({ success: true });
  }

  /**
   * マウスクリックを実行する
   * @param req リクエスト
   * @param res レスポンス
   */
  click(req: Request, res: Response): void {
    const { button, double } = req.body;
    const validButtons: MouseButton[] = ['left', 'right', 'middle'];

    // 入力値の検証
    if (!validButtons.includes(button)) {
      res.status(400).json({ error: '不正なリクエスト: button は left, right, middle のいずれかである必要があります' });
      return;
    }

    this.mouseService.click(button, !!double);
    res.json({ success: true });
  }

  /**
   * ドラッグ＆ドロップを実行する
   * @param req リクエスト
   * @param res レスポンス
   */
  dragAndDrop(req: Request, res: Response): void {
    const { startX, startY, endX, endY, button = 'left' } = req.body;
    const validButtons: MouseButton[] = ['left', 'right', 'middle'];

    // 入力値の検証
    if (
      typeof startX !== 'number' || 
      typeof startY !== 'number' || 
      typeof endX !== 'number' || 
      typeof endY !== 'number'
    ) {
      res.status(400).json({ error: '不正なリクエスト: startX, startY, endX, endY は数値である必要があります' });
      return;
    }

    if (button && !validButtons.includes(button)) {
      res.status(400).json({ error: '不正なリクエスト: button は left, right, middle のいずれかである必要があります' });
      return;
    }

    this.mouseService.dragAndDrop(startX, startY, endX, endY, button);
    res.json({ success: true });
  }
} 
