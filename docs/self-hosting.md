---
summary: "Complete guide for self-hosting ClawHub with Docker"
read_when:
  - Self-hosting ClawHub
  - Docker deployment
---

# Self-Hosted Deployment (自部署)

ClawHub 支持完全自部署，包括 Convex 后端和 Web 前端。

## 架构概览

自部署包含以下组件：
- **Convex 后端** (`ghcr.io/get-convex/convex-backend`) - 数据库、文件存储、HTTP API
- **MySQL 8.4** - Convex 后端的数据存储
- **ClawHub Web** - 前端应用（TanStack Start）

## 1) 构建 Docker 镜像

### 构建前端镜像

```bash
docker build -t clawhub-web:latest -f Dockerfile.web .
```

配置在容器启动时通过环境变量替换（见下文），无需在构建时指定。

### 构建后端部署镜像（可选）

如果需要重新构建 Convex 后端部署镜像：

```bash
docker build -t clawhub-convex-backend:latest -f Dockerfile.deploy .
```

### 构建前端开发镜像（可选）

用于本地开发：

```bash
docker build -t clawhub-web-dev:latest -f Dockerfile.web.dev .
```

### 构建 CLI 镜像（可选）

用于在容器中运行 ClawHub CLI：

```bash
docker build -t clawhub-cli:latest -f Dockerfile.cli .
```

## 2) 配置环境变量

创建 `clawhub-config/.env.local` 文件：

```bash
# Frontend
VITE_CONVEX_URL=http://localhost:3210
VITE_CONVEX_SITE_URL=http://localhost:3211
SITE_URL=http://localhost:3000

CONVEX_SELF_HOSTED_URL='http://localhost:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='<your admin key>'
```

## 3) 启动服务

### 启动 Convex 后端 + MySQL

```bash
cd clawhub-config
docker-compose -f docker-compose-convex.yml up -d
```

等待 MySQL 健康检查通过后，Convex 后端即可使用。

### 为 dashboard / CLI 生成 admin key
```bash
docker-compose -f docker-compose-convex.yml exec backend ./generate_admin_key.sh
Admin key:
convex-self-hosted|01fbc1985ffcd91e8317f25294a872535eecd1097e4c639aefc97677777baaa4ffe2782994
```

### 配置 Convex Dashboard 环境变量

#### 生成 JWT 密钥对
- 安装 jose
```bash
npm install jose
```

- 执行 node generateKeys.mjs
```bash
node generateKeys.mjs
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY----- MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDlywHdG4zkZFlX yaZPuEf1TmMHQdKVrDQeuRJPCW4697Rqi/QBUeV121GMb5Cv+yVg1Ksre7ysT6+N zqJonpXaGObS1eiMW/xqyi995Ixhszq7ejpk9LfpCfwkjN6SMeaECj4U2LxRzYXg G9baRfrKoD5GsKTCYmh27GhaqkDjSkOdrOriNNBKrXFwoAfWDTJ1eEW5gk/wHl+2 NN+KRYeQelt9FpooqkDdjQovP2yejxGtDnvuoJO0zGnARpZqHs/yREwsnplaHg9j DDYkNkD9oYFixVAAQ45YOhhDNax0i4b+Jkq+8WZV0ZTaN3GYrSGEaQbrWPiYZDvp ZEF6MZGhAgMBAAECggEABdl9zsEBfHWysbtM4NE9Z7KBbwrCaRP51nrG/m/fhSz1 qnngkfRucmpNI6JaNqVrUkRnpqye/p+F320n3jqECj0n1xMh7DzFN3scUi7/HqRf Qnl+KUBZIPU9Njlg/kWHhP7CJzazNVcVgtrcKv2s2i6esNIuh4VvLyPQ4XBdd+VJ aVoqH9QRXcvXDg6UfiEpflUda6Fu2t7Of3VdjtogNWFEJbdjQ9aF/z9virpDPqw3 UrTHOE7sbs2Qe//oArHYIsXwH2udC7adTc/9CdVurAAEwmErgr9JFiOeHhcEpiDI qpxZVIC74qCv8YxlWEbbc6iA65yt/xK0sDdcoKEhnwKBgQD7wNutVSoqDsRXPatF VL8qVPtNwU00BhE/VVmUc6oYeAEhetaP+dxvkEZtISAX7EAWy48dL5Z6jJdxLmoB YLIXFLcr28BDYziAQDBz30BC42o0dj+Gl3u1lTzPLAeHnms2W+6iflzF4h/cUZEU SyPpaSMUKKfzfVsd6CA+/ukEhwKBgQDpq1FzgUIDyEz1oej/eBrSc3jwrHjMQg9+ lh/l6pHRmBIenubH70cRbtCcwP92riAWIU077jve+vCQqMH84ELXTqHfjRt1wU2I r+kV+QXvZZ9kP6Bdn6eh6j29shzj47OU18Ta9ZxRAGlniaA6PmvAoNe2nwegKInx r3BJ3iBqlwKBgBx+1d6mtyEPjtW5Gzu7ve+Ssuc4K/7peOZMSNluxiAC5U3e0450 X6kZEX+ksjdC/HYYEFjjXAr/At1CvajuQvot1BXYx8hY4LpTiahz6pgnmYvanpIj b1M8Uye3+ho1qjj66uXlm6aiU6ziZqN/Zc8zoU7U0z3SQJAACDZZMBLdAoGAK3dp 5GGUBR4aasrei78sxh8izSpYIi7bsQF+F4fF7kYqgLWwWlrBTpXdintASjRj1ZoG QvKzAmyNmWs7Aq444NJIvEwEYqg9owKOCj9Tgk/WEZDgZOoRBcaMC6B5TU8LFdH5 VX3AwTShZtgsDQmVg7Sny9nTUlCYMHQhICyIvSsCgYA9e43iBhYzue6cC5TrK6kK fkKDhpII7FYRafkR2t02lhphTBVW7jxRrzSlkPf4NHVd2o392IYaw7d3qnhTID88 yUZNvC3EhZ92ac7tfx1WNHnv3cDUvWPEcfqaUl28HzUTUDNk5pkC2VyhGAAF8yFk 1vrSRjEMwnV2fEXDEb/RqQ== -----END PRIVATE KEY-----"
JWKS={"keys":[{"use":"sig","kty":"RSA","n":"5csB3RuM5GRZV8mmT7hH9U5jB0HSlaw0HrkSTwluOve0aov0AVHlddtRjG-Qr_slYNSrK3u8rE-vjc6iaJ6V2hjm0tXojFv8asovfeSMYbM6u3o6ZPS36Qn8JIzekjHmhAo-FNi8Uc2F4BvW2kX6yqA-RrCkwmJoduxoWqpA40pDnazq4jTQSq1xcKAH1g0ydXhFuYJP8B5ftjTfikWHkHpbfRaaKKpA3Y0KLz9sno8RrQ577qCTtMxpwEaWah7P8kRMLJ6ZWh4PYww2JDZA_aGBYsVQAEOOWDoYQzWsdIuG_iZKvvFmVdGU2jdxmK0hhGkG61j4mGQ76WRBejGRoQ","e":"AQAB"}]}
```

#### 配置环境变量

- 登录 Convex Dashboard（http://localhost:6791），输入 admin key（通过 `generate_admin_key.sh` 生成）

- 在 Convex 仪表板配置以下变量（将 IP 地址替换为你实际的服务器 IP）：

   - `JWT_PRIVATE_KEY`：复制私钥内容（不要包含引号）
   - `JWKS`：复制 JWKS JSON 内容
   - `SITE_URL`：`http://localhost:3000`


### 启动 ClawHub Web 前端

```bash
docker-compose -f docker-compose-clawhub-web.yml up -d
```

### 部署 ClawHub 后端代码到自托管 Convex

```bash
docker-compose -f docker-compose-clawhub-backend.yml run --rm convex-backend
```

## 4) 访问服务

- **Web 前端**: http://localhost:3000
- **Convex 后端 API**: http://localhost:3210
- **Convex Dashboard**: http://localhost:6791
