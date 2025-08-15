# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装所有依赖（包括devDependencies）并清理缓存
RUN npm ci --only=production=false && \
    npm cache clean --force

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 生产阶段 - 使用distroless镜像获得最小体积
FROM gcr.io/distroless/nodejs20-debian12 AS production

# 设置工作目录
WORKDIR /app

# 从构建阶段复制package.json（用于npm start）
COPY --from=builder /app/package*.json ./

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 从构建阶段复制生产依赖
COPY --from=builder /app/node_modules ./node_modules

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV CORS_ORIGIN=*

# 暴露端口
EXPOSE 3000

# 直接运行node（distroless镜像没有shell）
CMD ["dist/index.js"]