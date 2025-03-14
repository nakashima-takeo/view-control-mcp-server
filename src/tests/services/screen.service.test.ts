/**
 * @file 画面キャプチャサービスのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import { ScreenService } from '../../services/screen.service';

// screenshot-desktopをモック化
jest.mock('screenshot-desktop', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(Buffer.from('fake-image-data'))
}));

import screenshot from 'screenshot-desktop';

// fsをモック化
jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined)
}));

import { writeFile } from 'node:fs/promises';

describe('ScreenService', () => {
  let screenService: ScreenService;

  beforeEach(() => {
    screenService = new ScreenService();
    jest.clearAllMocks();
  });

  describe('capture', () => {
    it('画面キャプチャを取得できること', async () => {
      const result = await screenService.capture();
      expect(result).toEqual(Buffer.from('fake-image-data'));
      expect(screenshot).toHaveBeenCalledTimes(1);
    });
  });

  describe('captureAndSave', () => {
    it('画面キャプチャを取得して保存できること', async () => {
      const path = '/path/to/screenshot.png';
      await screenService.captureAndSave(path);
      
      expect(screenshot).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith(path, Buffer.from('fake-image-data'));
    });
  });
}); 
