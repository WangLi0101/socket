/**
 * Socket.IO 事件处理器
 */

import type { Server, Socket } from 'socket.io';
import type {
  AnswerPayload,
  CallBack,
  CallControlPayload,
  ChatPayload,
  ClientToServerEvents,
  IceCandidatePayload,
  InterServerEvents,
  MessageWrapper,
  OfferPayload,
  ServerToClientEvents,
  SocketData,
} from '../types/socket';
import type { UserPayload } from '../users/index';
import {
  addUser,
  getUsers,
  updateNewMessageStatus,
  updateOnlineStatus,
  removeUser,
} from '../users/index';
import { addMessage, getMessages, deleteMessage } from '../message/index';

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
  const user = { id: userId, userName };
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
          handlerChatMessage(socket, payload as ChatPayload, callback);
          break;
        case 'getUsers':
          handlerGetUsers(socket);
          break;
        case 'getMessages':
          handlerGetMessages(socket, data.payload as string);
          break;
        case 'offer':
          handlerOffer(socket, payload as OfferPayload);
          break;
        case 'answer':
          handlerAnswer(socket, payload as AnswerPayload);
          break;
        case 'ice-candidate':
          handlerIceCandidate(socket, payload as IceCandidatePayload);
          break;
        case 'call-control':
          handlerCallControl(socket, payload as CallControlPayload);
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
function handlerConnection(
  socket: TypedSocket,
  user: UserPayload,
  io: TypedServer,
) {
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
  payload: ChatPayload,
  callback?: CallBack,
) {
  const { receiverId, ...data } = payload;
  const message = {
    receiverId,
    senderId: socket.data.userId,
    ...data,
  };
  const res = await addMessage(message);
  updateNewMessageStatus(receiverId, true);
  const messageWrapper: MessageWrapper = {
    type: 'chat',
    payload: res,
  };
  if (callback) {
    callback({ code: 0, payload: res });
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
  updateNewMessageStatus(userId, false);
  socket.emit('message', {
    type: 'getMessages',
    payload: messages,
  });
}

/**
 * 处理WebRTC offer事件
 */
function handlerOffer(socket: TypedSocket, payload: OfferPayload) {
  const { receiverId, offer } = payload;
  console.log(`转发 offer 从 ${socket.data.userId} 到 ${receiverId}`);

  // 转发offer给接收者
  socket.to(receiverId).emit('message', {
    type: 'offer',
    payload: {
      offer,
      senderId: socket.data.userId,
    },
  });
}

/**
 * 处理WebRTC answer事件
 */
function handlerAnswer(socket: TypedSocket, payload: AnswerPayload) {
  const { receiverId, answer } = payload;
  console.log(`转发 answer 从 ${socket.data.userId} 到 ${receiverId}`);

  // 转发answer给接收者
  socket.to(receiverId).emit('message', {
    type: 'answer',
    payload: {
      answer,
      senderId: socket.data.userId,
    },
  });
}

/**
 * 处理WebRTC ICE candidate事件
 */
function handlerIceCandidate(
  socket: TypedSocket,
  payload: IceCandidatePayload,
) {
  const { receiverId, candidate } = payload;
  console.log(`转发 ICE candidate 从 ${socket.data.userId} 到 ${receiverId}`);

  // 转发ICE candidate给接收者
  socket.to(receiverId).emit('message', {
    type: 'ice-candidate',
    payload: {
      candidate,
      senderId: socket.data.userId,
    },
  });
}

/**
 * 处理呼叫控制事件（接听、拒绝、挂断）
 */
function handlerCallControl(socket: TypedSocket, payload: CallControlPayload) {
  const { receiverId, action } = payload;
  console.log(
    `转发呼叫控制 ${action} 从 ${socket.data.userId} 到 ${receiverId}`,
  );

  // 转发呼叫控制事件给接收者
  socket.to(receiverId).emit('message', {
    type: 'call-control',
    payload: {
      action,
      senderId: socket.data.userId,
    },
  });
}

/**
 * 清理离线用户和相关聊天记录
 */
function cleanupOfflineUsersAndMessages(): void {
  try {
    const users = getUsers();
    const offlineUsers = users.filter(user => !user.isOnline);

    console.log(`开始清理 ${offlineUsers.length} 个离线用户及其聊天记录`);

    offlineUsers.forEach(user => {
      // 删除用户的聊天记录
      deleteMessage(user.id);
      // 删除用户
      removeUser(user.id);
      console.log(`已清理用户: ${user.userName} (${user.id})`);
    });

    console.log(`清理完成，清理了 ${offlineUsers.length} 个离线用户`);
  } catch (error) {
    console.error('清理离线用户时发生错误:', error);
  }
}

/**
 * 初始化定时清理任务
 */
export function initCleanupScheduler(): void {
  // 每小时执行一次清理任务 (3600000 毫秒 = 1小时)
  const cleanupInterval = setInterval(() => {
    console.log('执行定时清理任务...');
    cleanupOfflineUsersAndMessages();
  }, 3600000);

  console.log('定时清理任务已启动，每小时执行一次');

  // 确保在进程退出时清理定时器
  process.on('SIGINT', () => {
    console.log('正在停止定时清理任务...');
    clearInterval(cleanupInterval);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('正在停止定时清理任务...');
    clearInterval(cleanupInterval);
    process.exit(0);
  });
}
