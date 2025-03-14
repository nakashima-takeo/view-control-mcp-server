/**
 * @file 画面キャプチャサービス
 * @index 1. インポート
 * 2. サービスクラス
 */

import screenshot from 'screenshot-desktop';
import { writeFile } from 'node:fs/promises';

/**
 * 画面キャプチャを提供するサービスクラス
 */
export class ScreenService {
  /**
   * 画面キャプチャを取得する
   * @returns 画像データのBuffer
   */
  async capture(): Promise<Buffer> {
    return await screenshot();
  }

  /**
   * 画面キャプチャを取得して指定したパスに保存する
   * @param path 保存先のパス
   */
  async captureAndSave(path: string): Promise<void> {
    const imageBuffer = await this.capture();
    await writeFile(path, imageBuffer);
  }
} 
