#!/bin/bash
set -e

echo "🚀 Starting Convex backend deployment to self-hosted instance..."

# 检查必需的环境变量
if [ -z "$CONVEX_SELF_HOSTED_URL" ]; then
    echo "❌ Error: CONVEX_SELF_HOSTED_URL environment variable is required"
    echo "   Please set it in your .env.local file"
    exit 1
fi

if [ -z "$CONVEX_SELF_HOSTED_ADMIN_KEY" ]; then
    echo "❌ Error: CONVEX_SELF_HOSTED_ADMIN_KEY environment variable is required"
    echo "   Please set it in your .env.local file"
    exit 1
fi

echo "📍 Deploying to self-hosted Convex at: $CONVEX_SELF_HOSTED_URL"

# 显示 Convex 版本
echo "📦 Convex CLI version:"
bunx convex --version || echo "   (version check skipped)"

# 执行部署（环境变量已通过 docker-compose 从 .env.local 传递）
echo "⚙️  Running convex deploy..."
bunx convex deploy --typecheck=disable --yes

echo "✅ Deployment completed successfully!"
echo "🌐 Your Convex backend is now live at: $CONVEX_SELF_HOSTED_URL"
