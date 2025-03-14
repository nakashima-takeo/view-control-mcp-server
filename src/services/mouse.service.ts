/**
 * @file マウス操作サービス
 * @index 1. インポート
 * 2. 型定義
 * 3. サービスクラス
 */

import robotjs from 'robotjs';

/**
 * マウスボタンの種類
 */
export type MouseButton = 'left' | 'right' | 'middle';

/**
 * マウス位置の型
 */
export interface MousePosition {
  x: number;
  y: number;
}

/**
 * マウス操作を提供するサービスクラス
 */
export class MouseService {
  /**
   * 現在のマウス位置を取得する
   * @returns マウス位置
   */
  getPosition(): MousePosition {
    return robotjs.getMousePos();
  }

  /**
   * マウスを指定した座標に移動する
   * @param x X座標
   * @param y Y座標
   */
  move(x: number, y: number): void {
    const screenSize = robotjs.getScreenSize();
    
    // 座標を画面内に収める
    const safeX = Math.max(0, Math.min(x, screenSize.width - 1));
    const safeY = Math.max(0, Math.min(y, screenSize.height - 1));
    
    robotjs.moveMouse(safeX, safeY);
  }

  /**
   * マウスクリックを実行する
   * @param button クリックするボタン
   * @param double ダブルクリックかどうか
   */
  click(button: MouseButton = 'left', double: boolean = false): void {
    robotjs.mouseClick(button, double);
  }

  /**
   * ドラッグ＆ドロップを実行する
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param endX 終了X座標
   * @param endY 終了Y座標
   * @param button 使用するボタン
   */
  dragAndDrop(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    button: MouseButton = 'left'
  ): void {
    // 開始位置に移動
    this.move(startX, startY);
    
    // マウスボタンを押下
    robotjs.mouseToggle('down', button);
    
    // 終了位置にドラッグ
    robotjs.dragMouse(endX, endY);
    
    // マウスボタンを離す
    robotjs.mouseToggle('up', button);
  }
} 
