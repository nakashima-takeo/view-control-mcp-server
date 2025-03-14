#!/usr/bin/env node
/**
 * @file エントリーポイント
 * @index 1. インポート
 * 2. サーバー起動
 */

// デバッグログ
process.stderr.write('Starting src/index.ts\n');

import { MCPProtocolHandler, type Tool } from './mcp-protocol';
import { StdioTransportHandler } from './stdio-transport';
import { MouseService } from './services/mouse.service';
import { KeyboardService } from './services/keyboard.service';
import { ScreenService } from './services/screen.service';

// デバッグログ
process.stderr.write('Imports completed\n');

// デフォルトエクスポート
export * from './services/mouse.service';
export * from './services/keyboard.service';
export * from './services/screen.service';

/**
 * stderrにログを出力する
 * @param message ログメッセージ
 */
function logToStderr(message: string): void {
  process.stderr.write(`${message}\n`);
}

/**
 * 親プロセスがCursorかどうかを判定する
 * @returns Cursorから実行されている場合はtrue
 */
function isRunningFromCursor(): boolean {
  try {
    // デバッグログ
    process.stderr.write('Checking if running from Cursor...\n');
    process.stderr.write(`process.ppid: ${process.ppid}\n`);
    process.stderr.write(`CURSOR_MCP_CLIENT: ${process.env.CURSOR_MCP_CLIENT}\n`);
    process.stderr.write(`argv: ${JSON.stringify(process.argv)}\n`);
    
    // 親プロセスの存在確認
    if (!process.ppid) {
      process.stderr.write('No parent process ID found\n');
      return false;
    }
    
    // 環境変数でCursorからの実行を検出
    if (process.env.CURSOR_MCP_CLIENT === 'true') {
      process.stderr.write('Detected CURSOR_MCP_CLIENT=true\n');
      return true;
    }
    
    // コマンドライン引数でCursorからの実行を検出
    if (process.argv.includes('--cursor-mcp-client')) {
      process.stderr.write('Detected --cursor-mcp-client argument\n');
      return true;
    }
    
    process.stderr.write('Not running from Cursor\n');
    return false;
  } catch (error) {
    process.stderr.write(`Error in isRunningFromCursor: ${error}\n`);
    return false;
  }
}

/**
 * MCPメソッドを設定する
 * @param mcpHandler MCPプロトコルハンドラー
 * @param mouseService マウスサービス
 * @param keyboardService キーボードサービス
 * @param screenService スクリーンサービス
 */
function setupMCPMethods(
  mcpHandler: MCPProtocolHandler,
  mouseService: MouseService,
  keyboardService: KeyboardService,
  screenService: ScreenService
): void {
  // MCP初期化メソッド
  mcpHandler.registerMethod('initialize', async (params) => {
    const initParams = params as {
      protocolVersion: string;
      capabilities: {
        sampling?: Record<string, unknown>;
        roots?: {
          listChanged?: boolean;
        };
      };
      clientInfo: {
        name: string;
        version: string;
      };
    };

    logToStderr(`Received initialize request: ${JSON.stringify(initParams)}`);

    // サポートするプロトコルバージョンを確認
    const supportedVersion = '2024-11-05';
    const negotiatedVersion = initParams.protocolVersion === supportedVersion
      ? supportedVersion
      : supportedVersion;

    return {
      protocolVersion: negotiatedVersion,
      serverInfo: {
        name: 'MCP Server',
        description: 'Model Context Protocol Server for local PC control',
        version: '1.0.1'
      },
      capabilities: {
        // このサーバーがサポートする機能
        tools: {
          listChanged: true
        }
      },
      offerings: [
        {name: "mouse", description: "マウス操作機能"},
        {name: "keyboard", description: "キーボード操作機能"},
        {name: "screen", description: "スクリーンキャプチャ機能"}
      ]
    };
  });

  // 初期化完了通知ハンドラー
  mcpHandler.registerMethod('notifications/initialized', async () => {
    logToStderr('Client initialized notification received');
    // 通知に対してはレスポンスを返さない
    return null;
  });

  // pingメソッド
  mcpHandler.registerMethod('ping', async () => {
    logToStderr('Received ping request');
    return {};
  });

  // listOfferingsメソッド
  mcpHandler.registerMethod('listOfferings', async () => {
    logToStderr('Received listOfferings request');
    return {
      serverInfo: {
        name: 'MCP Server',
        description: 'Model Context Protocol Server for local PC control',
        version: '1.0.1'
      },
      capabilities: {
        tools: {
          listChanged: true
        }
      },
      offerings: [
        {name: "mouse", description: "マウス操作機能"},
        {name: "keyboard", description: "キーボード操作機能"},
        {name: "screen", description: "スクリーンキャプチャ機能"}
      ]
    };
  });

  // ツールリスト取得メソッド
  mcpHandler.registerMethod('tools/list', async () => {
    logToStderr('Received tools/list request');
    const tools = mcpHandler.getTools();
    return {
      tools: tools,
      nextCursor: "" // nullではなく空文字列を使用
    };
  });

  // ツール呼び出しメソッド
  mcpHandler.registerMethod('tools/call', async (params) => {
    const callParams = params as {
      name: string;
      arguments: Record<string, unknown>;
    };
    
    logToStderr(`Received tools/call request: ${JSON.stringify(callParams)}`);
    
    if (!callParams.name) {
      throw new Error('Tool name is required');
    }
    
    // ツール名に対応するメソッドを呼び出す
    const methodName = `tools/call/${callParams.name}`;
    if (!mcpHandler.hasMethod(methodName)) {
      throw new Error(`Tool not found: ${callParams.name}`);
    }
    
    try {
      const result = await mcpHandler.callMethod(methodName, callParams.arguments);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        isError: false
      };
    } catch (error) {
      logToStderr(`Error calling tool ${callParams.name}: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: error instanceof Error ? error.message : 'Unknown error'
          }
        ],
        isError: true
      };
    }
  });

  // マウス関連メソッド
  mcpHandler.registerMethod('mouse.getPosition', async () => {
    const position = mouseService.getPosition();
    return {
      position: position
    };
  });

  mcpHandler.registerMethod('mouse.move', async (params) => {
    const { x, y } = params as { x: number; y: number };
    mouseService.move(x, y);
    return {
      success: true
    };
  });

  mcpHandler.registerMethod('mouse.click', async (params) => {
    const { button = 'left' } = params as { button?: 'left' | 'right' | 'middle' };
    mouseService.click(button);
    return {
      success: true
    };
  });

  // キーボード関連メソッド
  mcpHandler.registerMethod('keyboard.type', async (params) => {
    const { text } = params as { text: string };
    keyboardService.type(text);
    return {
      success: true
    };
  });

  mcpHandler.registerMethod('keyboard.press', async (params) => {
    const { key, modifiers = [] } = params as {
      key: string;
      modifiers?: ('command' | 'alt' | 'control' | 'shift' | 'fn')[]
    };
    keyboardService.pressKey(key, modifiers);
    return {
      success: true
    };
  });

  // スクリーン関連メソッド
  mcpHandler.registerMethod('screen.capture', async () => {
    const screenshot = await screenService.capture();
    return {
      image: screenshot.toString('base64')
    };
  });

  // サーバー情報メソッド
  mcpHandler.registerMethod('server.info', async () => {
    return {
      serverInfo: {
        name: 'MCP Server',
        description: 'Model Context Protocol Server for local PC control',
        version: '1.0.1',
        capabilities: ['mouse', 'keyboard', 'screen']
      }
    };
  });

  // ツールの登録
  // 1. マウス位置取得ツール
  const getPositionTool: Tool = {
    name: 'get_mouse_position',
    description: 'マウスの現在位置を取得するツール',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  };
  
  mcpHandler.registerTool(getPositionTool, async () => {
    const position = mouseService.getPosition();
    return {
      position: position
    };
  });
  
  // 2. マウス移動ツール
  const moveTool: Tool = {
    name: 'move_mouse',
    description: 'マウスを指定した座標に移動するツール',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' }
      },
      required: ['x', 'y']
    }
  };
  
  mcpHandler.registerTool(moveTool, async (params) => {
    const { x, y } = params as { x: number; y: number };
    mouseService.move(x, y);
    return {
      success: true
    };
  });
  
  // 3. マウスクリックツール
  const clickTool: Tool = {
    name: 'click_mouse',
    description: 'マウスをクリックするツール',
    inputSchema: {
      type: 'object',
      properties: {
        button: { 
          type: 'string',
          enum: ['left', 'right', 'middle']
        }
      }
    }
  };
  
  mcpHandler.registerTool(clickTool, async (params) => {
    const { button = 'left' } = params as { button?: 'left' | 'right' | 'middle' };
    mouseService.click(button);
    return {
      success: true
    };
  });
  
  // 4. テキスト入力ツール
  const typeTool: Tool = {
    name: 'type_text',
    description: 'テキストを入力するツール',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    }
  };
  
  mcpHandler.registerTool(typeTool, async (params) => {
    const { text } = params as { text: string };
    keyboardService.type(text);
    return {
      success: true
    };
  });
  
  // 5. キー押下ツール
  const pressTool: Tool = {
    name: 'press_key',
    description: 'キーを押下するツール',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        modifiers: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['command', 'alt', 'control', 'shift', 'fn']
          }
        }
      },
      required: ['key']
    }
  };
  
  mcpHandler.registerTool(pressTool, async (params) => {
    const { key, modifiers = [] } = params as {
      key: string;
      modifiers?: ('command' | 'alt' | 'control' | 'shift' | 'fn')[]
    };
    keyboardService.pressKey(key, modifiers);
    return {
      success: true
    };
  });
  
  // 6. スクリーンキャプチャツール
  const captureTool: Tool = {
    name: 'capture_screen',
    description: '画面をキャプチャするツール',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  };
  
  mcpHandler.registerTool(captureTool, async () => {
    const screenshot = await screenService.capture();
    return {
      image: screenshot.toString('base64')
    };
  });
  
  // 7. 計算ツール（例として）
  const calculateSumTool: Tool = {
    name: 'calculate_sum',
    description: '二つの数値を合計するツール',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['a', 'b']
    }
  };
  
  mcpHandler.registerTool(calculateSumTool, async (params) => {
    const { a, b } = params as { a: number; b: number };
    return {
      result: a + b
    };
  });
}

// デバッグログを削除
// process.stderr.write(`require.main: ${require.main ? require.main.filename : 'undefined'}\n`);
// process.stderr.write(`module: ${module.filename}\n`);
// process.stderr.write(`require.main === module: ${require.main === module}\n`);

// スタンドアロンモードの場合はサーバーを起動
// binスクリプトから実行された場合も含めて常に実行する
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (true) { // 常に実行するように変更
  process.stderr.write('Main module detected\n');
  try {
    // Stdioトランスポートモード
    logToStderr('Starting MCP Server in stdio transport mode...');
    
    // サービスの初期化
    process.stderr.write('Initializing services\n');
    const mouseService = new MouseService();
    const keyboardService = new KeyboardService();
    const screenService = new ScreenService();
    
    // MCPハンドラーの初期化
    process.stderr.write('Initializing MCP handler\n');
    const mcpHandler = new MCPProtocolHandler();
    
    // MCPメソッドの設定
    process.stderr.write('Setting up MCP methods\n');
    setupMCPMethods(mcpHandler, mouseService, keyboardService, screenService);
    
    // Stdioトランスポートの初期化と開始
    process.stderr.write('Creating Stdio transport\n');
    const stdioTransport = new StdioTransportHandler(mcpHandler);
    process.stderr.write('Starting Stdio transport\n');
    stdioTransport.start();
    process.stderr.write('Stdio transport started\n');

    // プロセス終了時のエラーハンドリング
    process.on('uncaughtException', (error) => {
      logToStderr(`Uncaught Exception: ${error}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logToStderr(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });
  } catch (error) {
    logToStderr(`Failed to start MCP Server: ${error}`);
    process.exit(1);
  }
}
