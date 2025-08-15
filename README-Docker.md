# WebRTC Socket 服务 Docker 部署指南

## 快速开始

### 1. 构建 Docker 镜像

```bash
# 在 socket 目录下执行
cd socket
docker build -t webrtc-socket-server .
```

### 2. 运行容器

```bash
# 基本运行（使用默认配置）
docker run -d \
  --name webrtc-socket \
  -p 3000:3000 \
  webrtc-socket-server

# 自定义端口运行
docker run -d \
  --name webrtc-socket \
  -p 8080:3000 \
  webrtc-socket-server

# 带环境变量运行
docker run -d \
  --name webrtc-socket \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=* \
  webrtc-socket-server
```

### 3. 验证服务

```bash
# 检查容器状态
docker ps

# 查看日志
docker logs webrtc-socket

# 健康检查
curl http://localhost:3000/health
```

## 配置说明

### 环境变量

- `NODE_ENV`: 运行环境 (默认: production)
- `PORT`: 服务端口 (默认: 3000)
- `CORS_ORIGIN`: 跨域配置 (默认: *)

### 端口映射

- 容器内端口: 3000
- 可映射到主机任意端口

## 管理命令

```bash
# 停止容器
docker stop webrtc-socket

# 启动容器
docker start webrtc-socket

# 重启容器
docker restart webrtc-socket

# 删除容器
docker rm webrtc-socket

# 删除镜像
docker rmi webrtc-socket-server
```

## 故障排除

### 查看详细日志

```bash
docker logs -f webrtc-socket
```

### 进入容器调试

```bash
docker exec -it webrtc-socket sh
```

### 检查网络连接

```bash
# 检查端口是否开放
netstat -tlnp | grep 3000

# 测试连接
telnet localhost 3000
```

## 生产环境建议

1. **使用反向代理**: 建议在生产环境中使用 Nginx 或其他反向代理
2. **SSL/TLS**: 为 WebRTC 连接配置 HTTPS
3. **监控**: 配置容器监控和日志收集
4. **资源限制**: 设置适当的内存和CPU限制

```bash
# 带资源限制的运行示例
docker run -d \
  --name webrtc-socket \
  -p 3000:3000 \
  --memory=512m \
  --cpus=1.0 \
  --restart=unless-stopped \
  webrtc-socket-server
```
