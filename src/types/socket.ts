/**
 * 应用程序的 Socket.IO 类型定义
 */

export interface ServerToClientEvents {
  // 消息事件
  message: (_data: MessageWrapper) => void;
  // 系统事件
  'connection-count': (_count: number) => void;
}

export interface ClientToServerEvents {
  // 消息事件
  message: (_data: MessageWrapper) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  connectedAt: Date;
}

// 消息包装器接口
export interface MessageWrapper {
  type: string;
  payload: unknown;
}

// 消息类型定义
export type MessageType = 'text' | 'system' | 'error' | 'notification';

// 不同类型消息的载荷接口
export interface TextMessagePayload {
  id: string;
  socketId: string;
  message: string;
  timestamp: Date;
}

export interface SystemMessagePayload {
  message: string;
  timestamp: Date;
}

export interface ErrorMessagePayload {
  message: string;
  code?: string;
  timestamp: Date;
}

export interface NotificationPayload {
  title: string;
  message: string;
  timestamp: Date;
}

// 客户端发送的消息载荷
export interface SendTextMessagePayload {
  message: string;
}

// 工具类型
export type SocketEventHandler<T = unknown> = (
  _data: T,
) => void | Promise<void>;

export interface ConnectionInfo {
  totalConnections: number;
}
