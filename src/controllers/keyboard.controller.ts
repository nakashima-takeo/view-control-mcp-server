/**
 * @file キーボードコントローラー
 * @index 1. インポート
 * 2. コントローラークラス
 */

import type { Request, Response } from 'express';
import type { KeyboardService, ModifierKey } from '../services/keyboard.service';

/**
 * キーボード操作のAPIエンドポイントを提供するコントローラークラス
 */
export class KeyboardController {
  /**
   * コンストラクタ
   * @param keyboardService キーボードサービス
   */
  constructor(private keyboardService: KeyboardService) {}

  /**
   * テキストを入力する
   * @param req リクエスト
   * @param res レスポンス
   */
  type(req: Request, res: Response): void {
    const { text } = req.body;

    // 入力値の検証
    if (typeof text !== 'string') {
      res.status(400).json({ error: '不正なリクエスト: text は文字列である必要があります' });
      return;
    }

    this.keyboardService.type(text);
    res.json({ success: true });
  }

  /**
   * キーを押下する
   * @param req リクエスト
   * @param res レスポンス
   */
  pressKey(req: Request, res: Response): void {
    const { key, modifiers = [] } = req.body;

    // 入力値の検証
    if (typeof key !== 'string') {
      res.status(400).json({ error: '不正なリクエスト: key は文字列である必要があります' });
      return;
    }

    if (modifiers && !Array.isArray(modifiers)) {
      res.status(400).json({ error: '不正なリクエスト: modifiers は配列である必要があります' });
      return;
    }

    this.keyboardService.pressKey(key, modifiers);
    res.json({ success: true });
  }

  /**
   * キーを押し続ける/離す
   * @param req リクエスト
   * @param res レスポンス
   */
  holdKey(req: Request, res: Response): void {
    const { key, down } = req.body;

    // 入力値の検証
    if (typeof key !== 'string') {
      res.status(400).json({ error: '不正なリクエスト: key は文字列である必要があります' });
      return;
    }

    if (typeof down !== 'boolean') {
      res.status(400).json({ error: '不正なリクエスト: down は真偽値である必要があります' });
      return;
    }

    this.keyboardService.holdKey(key, down);
    res.json({ success: true });
  }

  /**
   * ショートカットキーを実行する
   * @param req リクエスト
   * @param res レスポンス
   */
  shortcut(req: Request, res: Response): void {
    const { keys } = req.body;

    // 入力値の検証
    if (!Array.isArray(keys)) {
      res.status(400).json({ error: '不正なリクエスト: keys は配列である必要があります' });
      return;
    }

    this.keyboardService.shortcut(keys);
    res.json({ success: true });
  }
}
