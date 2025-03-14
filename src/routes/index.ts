/**
 * @file メインルーター
 * @index 1. インポート
 * 2. ルーター定義
 */

import { Router } from 'express';
import mouseRoutes from './mouse.routes';
import keyboardRoutes from './keyboard.routes';
import screenRoutes from './screen.routes';

// メインルーターを作成
const router = Router();

// 各機能のルーターをマウント
router.use('/mouse', mouseRoutes);
router.use('/keyboard', keyboardRoutes);
router.use('/screen', screenRoutes);

// ヘルスチェック用のエンドポイント
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router; 
