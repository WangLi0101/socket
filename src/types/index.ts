/**
 * 主要类型定义导出
 */

export * from './socket';

// 服务器配置类型
export interface ServerConfig {
  port: number;
  corsOrigin: string | string[];
  maxConnections?: number;
  pingTimeout?: number;
  pingInterval?: number;
}

// 环境变量
export interface EnvConfig {
  PORT: string;
  CORS_ORIGIN: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// 工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
