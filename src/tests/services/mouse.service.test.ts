/**
 * @file マウス操作サービスのテスト
 * @index 1. インポート
 * 2. モック設定
 * 3. テストケース
 */

import { MouseService } from '../../services/mouse.service';

// robotjsをモック化
jest.mock('robotjs', () => ({
  moveMouse: jest.fn(),
  mouseClick: jest.fn(),
  mouseToggle: jest.fn(),
  dragMouse: jest.fn(),
  getMousePos: jest.fn().mockReturnValue({ x: 100, y: 100 }),
  getScreenSize: jest.fn().mockReturnValue({ width: 1920, height: 1080 })
}));

import robotjs from 'robotjs';

describe('MouseService', () => {
  let mouseService: MouseService;

  beforeEach(() => {
    mouseService = new MouseService();
    jest.clearAllMocks();
  });

  describe('getPosition', () => {
    it('マウスの現在位置を取得できること', () => {
      const position = mouseService.getPosition();
      expect(position).toEqual({ x: 100, y: 100 });
      expect(robotjs.getMousePos).toHaveBeenCalledTimes(1);
    });
  });

  describe('move', () => {
    it('指定した座標にマウスを移動できること', () => {
      mouseService.move(200, 300);
      expect(robotjs.moveMouse).toHaveBeenCalledWith(200, 300);
    });

    it('画面サイズを超える座標が指定された場合、画面内に収まるように調整すること', () => {
      mouseService.move(2000, 2000);
      expect(robotjs.moveMouse).toHaveBeenCalledWith(1919, 1079);
    });

    it('負の座標が指定された場合、0に調整すること', () => {
      mouseService.move(-100, -200);
      expect(robotjs.moveMouse).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('click', () => {
    it('左クリックを実行できること', () => {
      mouseService.click('left');
      expect(robotjs.mouseClick).toHaveBeenCalledWith('left', false);
    });

    it('右クリックを実行できること', () => {
      mouseService.click('right');
      expect(robotjs.mouseClick).toHaveBeenCalledWith('right', false);
    });

    it('ダブルクリックを実行できること', () => {
      mouseService.click('left', true);
      expect(robotjs.mouseClick).toHaveBeenCalledWith('left', true);
    });
  });

  describe('dragAndDrop', () => {
    it('ドラッグ＆ドロップを実行できること', () => {
      mouseService.dragAndDrop(100, 100, 200, 200);
      expect(robotjs.mouseToggle).toHaveBeenCalledWith('down', 'left');
      expect(robotjs.dragMouse).toHaveBeenCalledWith(200, 200);
      expect(robotjs.mouseToggle).toHaveBeenCalledWith('up', 'left');
    });
  });
}); 
