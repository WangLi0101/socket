/**
 * Socket.IO 事件处理器
 */

import type { Server, Socket } from 'socket.io';
import type {
  CallBack,
  ClientToServerEvents,
  InterServerEvents,
  MessagePayload,
  MessageWrapper,
  ServerToClientEvents,
  SocketData,
} from '@/types/socket.js';
import { generateMessageId } from '../utils/helpers.js';
import type { User } from '@/users/index.js';
import { addUser, getUsers, updateOnlineStatus } from '@/users/index.js';
import { addMessage, getMessages } from '@/message/index.js';
import type { Message } from '@/message/index.js';

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
  // 处理链接成功
  const { userName, userId } = socket.handshake.auth;
  const user = { id: userId, userName, isOnline: true };
  socket.data.userId = userId;
  socket.join(userId);
  handlerConnection(socket, user, io);
  // 设置事件处理器
  setupMessageHandlers(socket, io);
  // 处理断开连接
  setupDisconnectionHandler(socket, io);
}

/**
 * 设置消息相关的事件处理器
 */
function setupMessageHandlers(socket: TypedSocket, _io: TypedServer): void {
  socket.on('message', (data: MessageWrapper, callback?: CallBack) => {
    try {
      // 根据消息类型处理不同的载荷
      const { type, payload } = data;
      switch (type) {
        case 'chat':
          handlerChatMessage(socket, payload as MessagePayload, callback);
          break;
        case 'getUsers':
          handlerGetUsers(socket);
          break;
        case 'getMessages':
          handlerGetMessages(socket, data.payload as string);
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
function setupDisconnectionHandler(socket: TypedSocket, io: TypedServer): void {
  socket.on('disconnect', () => {
    try {
      handlerDisconnection(socket, io);
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
}

/**
 * 处理连接
 */
function handlerConnection(socket: TypedSocket, user: User, io: TypedServer) {
  // 存储user
  addUser(socket.data.userId, user);
  // 通知其他客户端有新用户加入
  io.emit('message', {
    type: 'getUsers',
    payload: getUsers(),
  });
}

/**
 * 处理断开连接
 */
function handlerDisconnection(socket: TypedSocket, _io: TypedServer) {
  updateOnlineStatus(socket.data.userId, false);
  socket.broadcast.emit('message', {
    type: 'getUsers',
    payload: getUsers(),
  });
}

/**
 * 处理文本消息
 */
async function handlerChatMessage(
  socket: TypedSocket,
  payload: MessagePayload,
  callback?: CallBack,
) {
  const { receiverId, ...data } = payload;
  const message: Message = {
    id: generateMessageId(),
    senderId: socket.data.userId,
    receiverId,
    ...data,
  };
  await addMessage(message);
  const messageWrapper: MessageWrapper = {
    type: 'chat',
    payload: message,
  };
  if (callback) {
    callback({ code: 0, payload: message });
  }

  socket.to(receiverId).emit('message', messageWrapper);
}

/**
 * 处理获取用户列表
 */
function handlerGetUsers(socket: TypedSocket) {
  socket.emit('message', {
    type: 'getUsers',
    payload: getUsers(),
  });
}

/**
 * 处理获取消息列表
 */
async function handlerGetMessages(socket: TypedSocket, userId: string) {
  const messages = await getMessages(socket.data.userId, userId);
  socket.emit('message', {
    type: 'getMessages',
    payload: messages,
  });
}
