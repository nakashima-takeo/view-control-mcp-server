/**
 * @file 画面キャプチャサービス
 * @index 1. インポート
 * 2. サービスクラス
 */

import screenshot from 'screenshot-desktop';
import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { stat } from 'node:fs/promises';

/**
 * ファイルシステムエラーの型定義
 */
interface FileSystemError extends Error {
  code?: string;
}

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
   * パスが有効かどうかを検証する
   * @param path 検証するパス
   * @throws ディレクトリが指定された場合にエラーをスロー
   */
  private async validatePath(path: string): Promise<void> {
    try {
      const stats = await stat(path);
      if (stats.isDirectory()) {
        throw new Error(`指定されたパスはディレクトリです: ${path}`);
      }
    } catch (error: unknown) {
      // ファイルが存在しない場合は問題ない（新規作成するため）
      if ((error as FileSystemError).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 指定されたパスのディレクトリが存在しない場合に作成する
   * @param path ファイルパス
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    const directory = dirname(path);
    try {
      await mkdir(directory, { recursive: true });
    } catch (error: unknown) {
      // ディレクトリが既に存在する場合は無視
      if ((error as FileSystemError).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 画面キャプチャを取得して指定したパスに保存する
   * @param path 保存先のパス
   */
  async captureAndSave(path: string): Promise<void> {
    // パスの検証
    await this.validatePath(path);

    // ディレクトリの存在確認と作成
    await this.ensureDirectoryExists(path);

    const imageBuffer = await this.capture();
    await writeFile(path, imageBuffer);
  }
}
