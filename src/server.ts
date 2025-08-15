/**
 * Socket.IO 服务器设置和配置
 */

import express, { type Express } from 'express';
import { type Server as HttpServer, createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types/socket';
import { handleConnection } from './socket/socketHandlers';
import { validateEnv } from './utils/helpers';

/**
 * 创建并配置 Socket.IO 服务器与 Express
 */
export function createSocketServer(): {
  app: Express;
  httpServer: HttpServer;
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  port: number;
} {
  const { port, corsOrigin } = validateEnv();

  // 创建 Express 应用
  const app = express();

  // 配置 Express 中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 基本健康检查端点
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 为测试提供 docs 目录的静态文件服务
  app.use('/docs', express.static('docs'));

  // 使用 Express 应用创建 HTTP 服务器
  const httpServer = createServer(app);

  // 创建具有类型安全的 Socket.IO 服务器
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // 连接设置
    pingTimeout: 60000,
    pingInterval: 25000,
    // 升级设置
    upgradeTimeout: 10000,
    // 最大 HTTP 缓冲区大小
    maxHttpBufferSize: 1e6,
    // 允许 EIO3
    allowEIO3: true,
  });

  // 处理连接
  io.on('connection', socket => {
    handleConnection(socket, io);
  });

  // 错误处理
  io.engine.on('connection_error', err => {
    console.error('Connection error:', err.req);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error context:', err.context);
  });

  return { app, httpServer, io, port };
}

/**
 * 启动服务器
 */
export function startServer(): {
  app: Express;
  httpServer: HttpServer;
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
} {
  const { app: _app, httpServer, io, port } = createSocketServer();
  const { corsOrigin } = validateEnv();

  httpServer.listen(port, () => {
    console.log(`🚀 Express + Socket.IO server running on port ${port}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
    console.log(`🌐 HTTP endpoints: http://localhost:${port}`);
    console.log(`   - Health check: http://localhost:${port}/health`);
    console.log(
      `   - Test client: http://localhost:${port}/docs/client-example.html`,
    );
    console.log(`🌐 CORS enabled for: ${JSON.stringify(corsOrigin)}`);
    console.log(`⚡ Server started at ${new Date().toISOString()}`);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      io.close(() => {
        console.log('Socket.IO server closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('HTTP server closed');
      io.close(() => {
        console.log('Socket.IO server closed');
        process.exit(0);
      });
    });
  });

  return { app: _app, httpServer, io };
}
