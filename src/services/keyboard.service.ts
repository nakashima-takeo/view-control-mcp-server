/**
 * @file キーボード操作サービス
 * @index 1. インポート
 * 2. 型定義
 * 3. サービスクラス
 */

import robotjs from 'robotjs';

/**
 * 修飾キーの型
 */
export type ModifierKey = 'command' | 'alt' | 'control' | 'shift' | 'fn';

/**
 * キーボード操作を提供するサービスクラス
 */
export class KeyboardService {
  /**
   * テキストを入力する
   * @param text 入力するテキスト
   */
  type(text: string): void {
    robotjs.typeString(text);
  }

  /**
   * キーを押下する
   * @param key 押下するキー
   * @param modifiers 修飾キーの配列
   */
  pressKey(key: string, modifiers: ModifierKey[] = []): void {
    robotjs.keyTap(key, modifiers);
  }

  /**
   * キーを押し続ける/離す
   * @param key 対象のキー
   * @param down trueなら押し続ける、falseなら離す
   */
  holdKey(key: string, down: boolean): void {
    robotjs.keyToggle(key, down ? 'down' : 'up');
  }

  /**
   * ショートカットキーを実行する
   * @param keys キーの配列（最後の要素がメインキー、それ以外は修飾キー）
   */
  shortcut(keys: string[]): void {
    if (keys.length === 0) {
      return;
    }

    // 最後の要素をメインキーとして取得
    const mainKey = keys[keys.length - 1];
    
    // 残りを修飾キーとして取得
    const modifiers = keys.slice(0, keys.length - 1) as ModifierKey[];
    
    // キーを押下
    this.pressKey(mainKey, modifiers);
  }
} 
