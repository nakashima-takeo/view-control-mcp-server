/**
 * @file マウスコントローラーのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import type { Request, Response } from 'express';
import { MouseController } from '../../controllers/mouse.controller';
import { MouseService } from '../../services/mouse.service';

// MouseServiceをモック化
jest.mock('../../services/mouse.service');

describe('MouseController', () => {
  let mouseController: MouseController;
  let mockMouseService: jest.Mocked<MouseService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // モックのリセット
    mockMouseService = new MouseService() as jest.Mocked<MouseService>;
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    mouseController = new MouseController(mockMouseService);
  });

  describe('getPosition', () => {
    it('マウス位置を取得して返すこと', () => {
      mockMouseService.getPosition.mockReturnValue({ x: 100, y: 200 });
      
      mouseController.getPosition(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.getPosition).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ x: 100, y: 200 });
    });
  });

  describe('move', () => {
    it('マウスを移動して成功レスポンスを返すこと', () => {
      mockRequest.body = { x: 300, y: 400 };
      
      mouseController.move(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.move).toHaveBeenCalledWith(300, 400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = { x: 'invalid' };
      
      mouseController.move(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.move).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '不正なリクエスト: x と y は数値である必要があります' });
    });
  });

  describe('click', () => {
    it('マウスクリックを実行して成功レスポンスを返すこと', () => {
      mockRequest.body = { button: 'left', double: false };
      
      mouseController.click(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.click).toHaveBeenCalledWith('left', false);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = { button: 'invalid' };
      
      mouseController.click(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.click).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '不正なリクエスト: button は left, right, middle のいずれかである必要があります' });
    });
  });

  describe('dragAndDrop', () => {
    it('ドラッグ＆ドロップを実行して成功レスポンスを返すこと', () => {
      mockRequest.body = { 
        startX: 100, 
        startY: 200, 
        endX: 300, 
        endY: 400,
        button: 'left'
      };
      
      mouseController.dragAndDrop(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.dragAndDrop).toHaveBeenCalledWith(100, 200, 300, 400, 'left');
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = { startX: 100 };
      
      mouseController.dragAndDrop(mockRequest as Request, mockResponse as Response);
      
      expect(mockMouseService.dragAndDrop).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: '不正なリクエスト: startX, startY, endX, endY は数値である必要があります' 
      });
    });
  });
}); 
