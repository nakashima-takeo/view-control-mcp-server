/**
 * @file 画面キャプチャコントローラーのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import type { Request, Response } from 'express';
import { ScreenController } from '../../controllers/screen.controller';
import { ScreenService } from '../../services/screen.service';

// ScreenServiceをモック化
jest.mock('../../services/screen.service');

// path, osをモック化
jest.mock('node:path', () => ({
  join: jest.fn().mockReturnValue('/path/to/screenshot.png')
}));

jest.mock('node:os', () => ({
  tmpdir: jest.fn().mockReturnValue('/tmp')
}));

import path from 'node:path';
import os from 'node:os';

describe('ScreenController', () => {
  let screenController: ScreenController;
  let mockScreenService: jest.Mocked<ScreenService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    // モックのリセット
    mockScreenService = new ScreenService() as jest.Mocked<ScreenService>;
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSend = jest.fn().mockReturnThis();
    mockSet = jest.fn().mockReturnThis();
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
      set: mockSet
    };

    screenController = new ScreenController(mockScreenService);
  });

  describe('capture', () => {
    it('画面キャプチャを取得して返すこと', async () => {
      const fakeImageBuffer = Buffer.from('fake-image-data');
      mockScreenService.capture.mockResolvedValue(fakeImageBuffer);
      
      await screenController.capture(mockRequest as Request, mockResponse as Response);
      
      expect(mockScreenService.capture).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(mockResponse.send).toHaveBeenCalledWith(fakeImageBuffer);
    });

    it('エラーが発生した場合は500エラーを返すこと', async () => {
      mockScreenService.capture.mockRejectedValue(new Error('キャプチャエラー'));
      
      await screenController.capture(mockRequest as Request, mockResponse as Response);
      
      expect(mockScreenService.capture).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'キャプチャの取得に失敗しました: キャプチャエラー' });
    });
  });

  describe('captureAndSave', () => {
    it('画面キャプチャを取得して保存し、ファイルパスを返すこと', async () => {
      mockRequest.body = { filename: 'test.png' };
      
      await screenController.captureAndSave(mockRequest as Request, mockResponse as Response);
      
      expect(path.join).toHaveBeenCalledWith(os.tmpdir(), 'test.png');
      expect(mockScreenService.captureAndSave).toHaveBeenCalledWith('/path/to/screenshot.png');
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        success: true, 
        path: '/path/to/screenshot.png' 
      });
    });

    it('ファイル名が指定されていない場合はデフォルト名を使用すること', async () => {
      mockRequest.body = {};
      
      // 日付をモック
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(1234567890);
      
      await screenController.captureAndSave(mockRequest as Request, mockResponse as Response);
      
      expect(path.join).toHaveBeenCalledWith(os.tmpdir(), 'screenshot_1234567890.png');
      
      // 日付のモックを元に戻す
      Date.now = originalDateNow;
    });

    it('エラーが発生した場合は500エラーを返すこと', async () => {
      mockRequest.body = { filename: 'test.png' };
      mockScreenService.captureAndSave.mockRejectedValue(new Error('保存エラー'));
      
      await screenController.captureAndSave(mockRequest as Request, mockResponse as Response);
      
      expect(mockScreenService.captureAndSave).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'キャプチャの保存に失敗しました: 保存エラー' });
    });
  });
}); 
