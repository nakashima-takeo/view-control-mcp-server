/**
 * @file 画面キャプチャサービスのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import { ScreenService } from '../../services/screen.service';
import { dirname, join } from 'node:path';

// screenshot-desktopをモック化
jest.mock('screenshot-desktop', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(Buffer.from('fake-image-data'))
}));

import screenshot from 'screenshot-desktop';

// node:processをモック化
jest.mock('node:process', () => ({
  cwd: jest.fn().mockReturnValue('/current/working/directory')
}));

import { cwd } from 'node:process';

// fsをモック化
jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockImplementation((path) => {
    return Promise.resolve({
      isDirectory: () => false
    });
  })
}));

import { writeFile, mkdir, stat } from 'node:fs/promises';

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

  describe('getCurrentDirectory', () => {
    it('現在の作業ディレクトリを取得できること', () => {
      const result = screenService.getCurrentDirectory();
      expect(result).toBe('/current/working/directory');
      expect(cwd).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolveRelativePath', () => {
    it('絶対パスはそのまま返すこと', () => {
      const absolutePath = '/absolute/path/to/file.png';
      const result = screenService.resolveRelativePath(absolutePath);
      expect(result).toBe(absolutePath);
    });

    it('相対パスを絶対パスに変換すること', () => {
      const relativePath = 'relative/path/to/file.png';
      const expectedPath = '/current/working/directory/relative/path/to/file.png';
      const result = screenService.resolveRelativePath(relativePath);
      expect(result).toBe(expectedPath);
    });
  });

  describe('captureAndSave', () => {
    it('絶対パスで画面キャプチャを取得して保存できること', async () => {
      const path = '/path/to/screenshot.png';
      const result = await screenService.captureAndSave(path);
      
      expect(result).toBe(path);
      expect(screenshot).toHaveBeenCalledTimes(1);
      expect(stat).toHaveBeenCalledWith(path);
      expect(mkdir).toHaveBeenCalledWith(dirname(path), { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(path, Buffer.from('fake-image-data'));
    });

    it('相対パスで画面キャプチャを取得して保存できること', async () => {
      const relativePath = 'path/to/screenshot.png';
      const absolutePath = '/current/working/directory/path/to/screenshot.png';
      const result = await screenService.captureAndSave(relativePath);
      
      expect(result).toBe(absolutePath);
      expect(screenshot).toHaveBeenCalledTimes(1);
      expect(stat).toHaveBeenCalledWith(absolutePath);
      expect(mkdir).toHaveBeenCalledWith(dirname(absolutePath), { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(absolutePath, Buffer.from('fake-image-data'));
    });

    it('パスがディレクトリの場合はエラーをスローすること', async () => {
      const directoryPath = '/path/to/directory';
      
      // ディレクトリとして判定されるようにモックを変更
      (stat as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          isDirectory: () => true
        });
      });
      
      await expect(screenService.captureAndSave(directoryPath))
        .rejects.toThrow(`指定されたパスはディレクトリです: ${directoryPath}`);
      
      expect(screenshot).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });
  });
}); 
