/**
 * 应用程序的 Socket.IO 类型定义
 */

// WebRTC 类型定义 (用于 Node.js 环境)
export interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp?: string;
}

export type RTCSdpType = 'answer' | 'offer' | 'pranswer' | 'rollback';

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

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
  userId: string;
  connectedAt: Date;
}

export interface CallbackPayload {
  code: number;
  payload?: any;
}

export type CallBack = (_data: CallbackPayload) => void;
// 消息包装器接口

export interface MessageWrapper {
  type: string;
  payload: any;
  callback?: CallBack;
}

// 消息类型定义
export type MessageType = 'text' | 'system' | 'error' | 'notification';

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

// 工具类型
export type SocketEventHandler<T = unknown> = (
  _data: T,
) => void | Promise<void>;

export interface ConnectionInfo {
  totalConnections: number;
}

export interface ChatPayload {
  type: string;
  receiverId: string;
  data: string;
}

export interface OfferPayload {
  receiverId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerPayload {
  receiverId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidatePayload {
  receiverId: string;
  candidate: RTCIceCandidateInit;
}

export interface CallControlPayload {
  receiverId: string;
  action: 'accept' | 'reject' | 'hangup';
}
