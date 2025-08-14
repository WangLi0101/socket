/**
 * Socket.IO 事件处理器
 */

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  MessageWrapper,
  SendTextMessagePayload,
  ServerToClientEvents,
  SocketData,
  TextMessagePayload,
} from '@/types/socket.js';
import { createSystemMessage, generateMessageId } from '../utils/helpers.js';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * 处理新的 socket 连接
 */
export function handleConnection(socket: TypedSocket, io: TypedServer): void {
  console.log(`Client connected: ${socket.id}`);

  // 初始化 socket 数据
  socket.data = {
    connectedAt: new Date(),
  };

  // 向所有客户端发送连接数
  emitConnectionCount(io);

  // 发送系统消息通知新用户连接
  const welcomeMessage = createSystemMessage(`用户 ${socket.id} 已连接`);
  socket.broadcast.emit('message', welcomeMessage);

  // 设置事件处理器
  setupMessageHandlers(socket, io);
  setupDisconnectionHandler(socket, io);
}

/**
 * 设置消息相关的事件处理器
 */
function setupMessageHandlers(socket: TypedSocket, _io: TypedServer): void {
  socket.on('message', (data: MessageWrapper) => {
    try {
      // 根据消息类型处理不同的载荷
      switch (data.type) {
        case 'text':
          handleTextMessage(socket, data.payload as SendTextMessagePayload);
          break;
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
}

/**
 * 处理文本消息
 */
function handleTextMessage(
  socket: TypedSocket,
  payload: SendTextMessagePayload,
): void {
  const { message } = payload;

  if (!message.trim()) {
    console.log('Empty message received, ignoring');
    return;
  }

  const textPayload: TextMessagePayload = {
    id: generateMessageId(),
    socketId: socket.id,
    message: message.trim(),
    timestamp: new Date(),
  };

  const messageWrapper: MessageWrapper = {
    type: 'text',
    payload: textPayload,
  };

  // 广播给所有连接的客户端（除了发送者）
  socket.broadcast.emit('message', messageWrapper);
  console.log(`Broadcast message by ${socket.id}: ${message}`);
}

/**
 * 设置断开连接处理器
 */
function setupDisconnectionHandler(socket: TypedSocket, io: TypedServer): void {
  socket.on('disconnect', (reason: string) => {
    try {
      console.log(`Client disconnected: ${socket.id} - Reason: ${reason}`);

      // 发送系统消息通知用户断开连接
      const disconnectMessage = createSystemMessage(
        `用户 ${socket.id} 已断开连接`,
      );
      socket.broadcast.emit('message', disconnectMessage);

      // 发送更新的连接数
      emitConnectionCount(io);
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
}

/**
 * 向所有客户端发送当前连接数
 */
function emitConnectionCount(io: TypedServer): void {
  const count = io.engine.clientsCount;
  io.emit('connection-count', count);
}
