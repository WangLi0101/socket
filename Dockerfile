# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm (最新版本)
RUN npm install -g pnpm@latest

# 复制 package.json
COPY package.json ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S socketio -u 1001

# 更改文件所有权
RUN chown -R socketio:nodejs /app
USER socketio

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV CORS_ORIGIN=*

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["pnpm", "start"]
