/**
 * @file screenshot-desktopの型定義
 */

declare module 'screenshot-desktop' {
  /**
   * 画面キャプチャを取得する関数
   * @param options オプション
   * @returns 画像データのBuffer
   */
  function screenshot(options?: {
    format?: 'png' | 'jpg';
    screen?: number;
  }): Promise<Buffer>;

  export = screenshot;
} 
