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
import { generateMessageId } from '../utils/helpers.js';
import type { User } from '@/users/index.js';
import { addUser, getUsers, removeUser } from '@/users/index.js';

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
  // 处理链接成功
  const user = { id: socket.id, userName: socket.handshake.auth.userName };
  handlerConnection(socket, user);
  // 设置事件处理器
  setupMessageHandlers(socket, io);
  // 处理断开连接
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
 * 设置断开连接处理器
 */
function setupDisconnectionHandler(
  socket: TypedSocket,
  _io: TypedServer,
): void {
  socket.on('disconnect', () => {
    try {
      handlerDisconnection(socket);
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
}

/**
 * 处理连接
 */
function handlerConnection(socket: TypedSocket, user: User) {
  // 存储user
  addUser(socket.id, user);
  socket.broadcast.emit('message', { type: 'getUsers', payload: getUsers() });
}

/**
 * 处理断开连接
 */
function handlerDisconnection(socket: TypedSocket) {
  // 删除user
  removeUser(socket.id);
  socket.broadcast.emit('message', { type: 'getUsers', payload: getUsers() });
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
