# Nginx 配置部署指南

## 📋 配置说明

这个Nginx配置文件为 `socket_server.guxiaotong.cn` 域名提供了完整的反向代理服务，支持：

- ✅ **HTTPS/SSL** 加密连接
- ✅ **WebSocket** 代理 (Socket.IO)
- ✅ **CORS** 跨域支持
- ✅ **HTTP到HTTPS** 自动重定向
- ✅ **安全头** 配置
- ✅ **负载均衡** 支持

## 🚀 部署步骤

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# 或者 (CentOS 8+)
sudo dnf install nginx
```

### 2. 配置 SSL 证书

```bash
# 创建证书目录
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# 复制你的SSL证书文件
sudo cp your-certificate.crt /etc/ssl/certs/socket_server.guxiaotong.cn.crt
sudo cp your-private-key.key /etc/ssl/private/socket_server.guxiaotong.cn.key

# 设置正确的权限
sudo chmod 644 /etc/ssl/certs/socket_server.guxiaotong.cn.crt
sudo chmod 600 /etc/ssl/private/socket_server.guxiaotong.cn.key
```

### 3. 部署配置文件

```bash
# 复制配置文件到 Nginx 配置目录
sudo cp nginx.conf /etc/nginx/sites-available/socket_server.guxiaotong.cn

# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/socket_server.guxiaotong.cn /etc/nginx/sites-enabled/

# 测试配置文件语法
sudo nginx -t

# 重新加载 Nginx 配置
sudo systemctl reload nginx
```

### 4. 启动服务

```bash
# 启动 Docker 容器 (后端服务)
docker run -d \
  --name webrtc-socket \
  -p 127.0.0.1:3000:3000 \
  --restart=unless-stopped \
  webrtc-socket-server

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔧 配置自定义

### 修改后端服务地址

如果你的Socket服务运行在不同的端口或服务器上，修改 `upstream` 配置：

```nginx
upstream socket_backend {
    server 127.0.0.1:3000;  # 修改为你的实际地址
    # server 127.0.0.1:3001;  # 添加更多实例实现负载均衡
}
```

### SSL 证书路径

修改证书路径为你的实际路径：

```nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
```

### 日志路径

确保日志目录存在：

```bash
sudo mkdir -p /var/log/nginx
sudo chown www-data:www-data /var/log/nginx
```

## 🧪 测试验证

### 1. 检查服务状态

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 Docker 容器状态
docker ps | grep webrtc-socket

# 检查端口监听
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 2. 测试连接

```bash
# 测试 HTTP 重定向
curl -I http://socket_server.guxiaotong.cn

# 测试 HTTPS 连接
curl -I https://socket_server.guxiaotong.cn

# 测试健康检查
curl https://socket_server.guxiaotong.cn/health
```

### 3. 测试 WebSocket 连接

```javascript
// 在浏览器控制台测试
const socket = io('https://socket_server.guxiaotong.cn');
socket.on('connect', () => {
    console.log('WebSocket 连接成功!');
});
```

## 🔍 故障排除

### 查看日志

```bash
# Nginx 错误日志
sudo tail -f /var/log/nginx/socket_server.error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/socket_server.access.log

# Docker 容器日志
docker logs -f webrtc-socket
```

### 常见问题

1. **502 Bad Gateway**
   - 检查后端服务是否运行
   - 检查端口是否正确

2. **SSL 证书错误**
   - 验证证书文件路径和权限
   - 检查证书是否过期

3. **WebSocket 连接失败**
   - 确认 `proxy_set_header Upgrade` 配置正确
   - 检查防火墙设置

## 🛡️ 安全建议

1. **定期更新证书**
2. **监控访问日志**
3. **配置防火墙规则**
4. **启用 fail2ban** 防止暴力攻击
5. **定期备份配置文件**

## 📊 性能优化

```nginx
# 在 http 块中添加
worker_processes auto;
worker_connections 1024;

# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```
