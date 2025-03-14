/**
 * @file キーボード操作サービスのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import { KeyboardService } from '../../services/keyboard.service';

// robotjsをモック化
jest.mock('robotjs', () => ({
  keyTap: jest.fn(),
  keyToggle: jest.fn(),
  typeString: jest.fn()
}));

import robotjs from 'robotjs';

describe('KeyboardService', () => {
  let keyboardService: KeyboardService;

  beforeEach(() => {
    keyboardService = new KeyboardService();
    jest.clearAllMocks();
  });

  describe('type', () => {
    it('テキストを入力できること', () => {
      keyboardService.type('Hello, World!');
      expect(robotjs.typeString).toHaveBeenCalledWith('Hello, World!');
    });
  });

  describe('pressKey', () => {
    it('単一のキーを押下できること', () => {
      keyboardService.pressKey('a');
      expect(robotjs.keyTap).toHaveBeenCalledWith('a', []);
    });

    it('修飾キーと組み合わせてキーを押下できること', () => {
      keyboardService.pressKey('c', ['command']);
      expect(robotjs.keyTap).toHaveBeenCalledWith('c', ['command']);
    });

    it('複数の修飾キーと組み合わせてキーを押下できること', () => {
      keyboardService.pressKey('s', ['command', 'shift']);
      expect(robotjs.keyTap).toHaveBeenCalledWith('s', ['command', 'shift']);
    });
  });

  describe('holdKey', () => {
    it('キーを押し続けることができること', () => {
      keyboardService.holdKey('a', true);
      expect(robotjs.keyToggle).toHaveBeenCalledWith('a', 'down');
    });

    it('キーを離すことができること', () => {
      keyboardService.holdKey('a', false);
      expect(robotjs.keyToggle).toHaveBeenCalledWith('a', 'up');
    });
  });

  describe('shortcut', () => {
    it('ショートカットキーを実行できること', () => {
      keyboardService.shortcut(['command', 'c']);
      expect(robotjs.keyTap).toHaveBeenCalledWith('c', ['command']);
    });

    it('複数の修飾キーを含むショートカットを実行できること', () => {
      keyboardService.shortcut(['command', 'shift', 's']);
      expect(robotjs.keyTap).toHaveBeenCalledWith('s', ['command', 'shift']);
    });
  });
}); 
