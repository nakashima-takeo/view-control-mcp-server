/**
 * @file マウス操作のルーター
 * @index 1. インポート
 * 2. ルーター定義
 */

import { Router } from 'express';
import { MouseController } from '../controllers/mouse.controller';
import { MouseService } from '../services/mouse.service';

// マウスサービスとコントローラーのインスタンスを作成
const mouseService = new MouseService();
const mouseController = new MouseController(mouseService);

// ルーターを作成
const router = Router();

// エンドポイントを定義
router.get('/position', (req, res) => mouseController.getPosition(req, res));
router.post('/move', (req, res) => mouseController.move(req, res));
router.post('/click', (req, res) => mouseController.click(req, res));
router.post('/drag', (req, res) => mouseController.dragAndDrop(req, res));

export default router; 
