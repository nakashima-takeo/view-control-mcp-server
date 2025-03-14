/**
 * @file 画面キャプチャのルーター
 * @index 1. インポート
 * 2. ルーター定義
 */

import { Router } from 'express';
import { ScreenController } from '../controllers/screen.controller';
import { ScreenService } from '../services/screen.service';

// 画面キャプチャサービスとコントローラーのインスタンスを作成
const screenService = new ScreenService();
const screenController = new ScreenController(screenService);

// ルーターを作成
const router = Router();

// エンドポイントを定義
router.get('/capture', (req, res) => screenController.capture(req, res));
router.post('/save', (req, res) => screenController.captureAndSave(req, res));

export default router; 
