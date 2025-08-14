/**
 * 工具辅助函数
 */

import { randomBytes } from 'crypto';
import type {
  ErrorMessagePayload,
  MessageWrapper,
  NotificationPayload,
  SystemMessagePayload,
} from '@/types/socket.js';

/**
 * 生成唯一的消息 ID
 */
export function generateMessageId(): string {
  return `msg_${randomBytes(6).toString('hex')}_${Date.now()}`;
}

/**
 * 验证环境变量
 */
export function validateEnv(): {
  port: number;
  corsOrigin: string | string[];
} {
  const port = parseInt(process.env.PORT || '3000', 10);
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT environment variable');
  }

  return {
    port,
    corsOrigin: corsOrigin.includes(',')
      ? corsOrigin.split(',').map(origin => origin.trim())
      : corsOrigin,
  };
}

/**
 * 格式化时间戳用于日志记录
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * 安全的 JSON 字符串化，带错误处理
 */
export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Stringify Error: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

/**
 * 创建系统消息包装器
 */
export function createSystemMessage(message: string): MessageWrapper {
  const payload: SystemMessagePayload = {
    message,
    timestamp: new Date(),
  };

  return {
    type: 'system',
    payload,
  };
}

/**
 * 创建错误消息包装器
 */
export function createErrorMessage(
  message: string,
  code?: string,
): MessageWrapper {
  const payload: ErrorMessagePayload = {
    message,
    timestamp: new Date(),
    ...(code && { code }),
  };

  return {
    type: 'error',
    payload,
  };
}

/**
 * 创建通知消息包装器
 */
export function createNotificationMessage(
  title: string,
  message: string,
): MessageWrapper {
  const payload: NotificationPayload = {
    title,
    message,
    timestamp: new Date(),
  };

  return {
    type: 'notification',
    payload,
  };
}
