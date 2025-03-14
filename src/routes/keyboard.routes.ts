/**
 * @file キーボード操作のルーター
 * @index 1. インポート
 * 2. ルーター定義
 */

import { Router } from 'express';
import { KeyboardController } from '../controllers/keyboard.controller';
import { KeyboardService } from '../services/keyboard.service';

// キーボードサービスとコントローラーのインスタンスを作成
const keyboardService = new KeyboardService();
const keyboardController = new KeyboardController(keyboardService);

// ルーターを作成
const router = Router();

// エンドポイントを定義
router.post('/type', (req, res) => keyboardController.type(req, res));
router.post('/press', (req, res) => keyboardController.pressKey(req, res));
router.post('/hold', (req, res) => keyboardController.holdKey(req, res));
router.post('/shortcut', (req, res) => keyboardController.shortcut(req, res));

export default router;
