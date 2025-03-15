/**
 * @file 画面キャプチャサービス
 * @index 1. インポート
 * 2. サービスクラス
 */

import screenshot from 'screenshot-desktop';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import { cwd } from 'node:process';

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
   * 現在の作業ディレクトリを取得する
   * @returns 現在の作業ディレクトリ
   */
  getCurrentDirectory(): string {
    return cwd();
  }

  /**
   * 相対パスを絶対パスに変換する
   * @param relativePath 相対パス
   * @returns 絶対パス
   */
  resolveRelativePath(relativePath: string): string {
    // パスが既に絶対パスの場合はそのまま返す
    if (relativePath.startsWith('/')) {
      return relativePath;
    }
    
    // 相対パスを現在のディレクトリからの絶対パスに変換
    return join(this.getCurrentDirectory(), relativePath);
  }

  /**
   * 画面キャプチャを取得して指定したパスに保存する
   * @param path 保存先のパス（相対パスまたは絶対パス）
   * @returns 保存したファイルの絶対パス
   */
  async captureAndSave(path: string): Promise<string> {
    // 相対パスを絶対パスに解決
    const absolutePath = this.resolveRelativePath(path);
    
    // パスの検証
    await this.validatePath(absolutePath);
    
    // ディレクトリの存在確認と作成
    await this.ensureDirectoryExists(absolutePath);
    
    const imageBuffer = await this.capture();
    await writeFile(absolutePath, imageBuffer);
    
    return absolutePath;
  }
}
