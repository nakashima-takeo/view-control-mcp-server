/**
 * @file キーボードコントローラーのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import type { Request, Response } from 'express';
import { KeyboardController } from '../../controllers/keyboard.controller';
import { KeyboardService } from '../../services/keyboard.service';

// KeyboardServiceをモック化
jest.mock('../../services/keyboard.service');

describe('KeyboardController', () => {
  let keyboardController: KeyboardController;
  let mockKeyboardService: jest.Mocked<KeyboardService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // モックのリセット
    mockKeyboardService = new KeyboardService() as jest.Mocked<KeyboardService>;
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    keyboardController = new KeyboardController(mockKeyboardService);
  });

  describe('type', () => {
    it('テキストを入力して成功レスポンスを返すこと', () => {
      mockRequest.body = { text: 'Hello, World!' };
      
      keyboardController.type(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.type).toHaveBeenCalledWith('Hello, World!');
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = {};
      
      keyboardController.type(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.type).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '不正なリクエスト: text は文字列である必要があります' });
    });
  });

  describe('pressKey', () => {
    it('キーを押下して成功レスポンスを返すこと', () => {
      mockRequest.body = { key: 'a', modifiers: ['command'] };
      
      keyboardController.pressKey(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.pressKey).toHaveBeenCalledWith('a', ['command']);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('修飾キーなしでキーを押下できること', () => {
      mockRequest.body = { key: 'a' };
      
      keyboardController.pressKey(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.pressKey).toHaveBeenCalledWith('a', []);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = {};
      
      keyboardController.pressKey(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.pressKey).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '不正なリクエスト: key は文字列である必要があります' });
    });
  });

  describe('shortcut', () => {
    it('ショートカットキーを実行して成功レスポンスを返すこと', () => {
      mockRequest.body = { keys: ['command', 'c'] };
      
      keyboardController.shortcut(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.shortcut).toHaveBeenCalledWith(['command', 'c']);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('リクエストボディが不正な場合はエラーを返すこと', () => {
      mockRequest.body = {};
      
      keyboardController.shortcut(mockRequest as Request, mockResponse as Response);
      
      expect(mockKeyboardService.shortcut).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: '不正なリクエスト: keys は配列である必要があります' });
    });
  });
}); 
