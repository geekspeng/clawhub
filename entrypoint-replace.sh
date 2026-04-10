#!/bin/bash
# 零代码修改方案：替换占位符或硬编码 URL
# 无需修改应用源代码

set -e

echo "🔧 零代码修改：启动时替换配置..."

# 修复 SSR router 和实际 CSS 文件的哈希不一致问题
ACTUAL_CSS=$(ls /app/public/assets/styles-*.css 2>/dev/null | head -1 | xargs basename 2>/dev/null)
if [ -n "$ACTUAL_CSS" ]; then
  find /app/server/_ssr -name "*.mjs" -exec sed -i \
    "s|styles-[A-Za-z0-9_-]*\.css|$ACTUAL_CSS|g" {} \;
  echo "🎨 CSS 引用已修复: $ACTUAL_CSS"
fi

# 从环境变量获取配置（支持占位符和硬编码）
CONVEX_URL=${VITE_CONVEX_URL:-${CONVEX_URL:-http://192.168.56.128:3210}}
CONVEX_SITE_URL=${VITE_CONVEX_SITE_URL:-${CONVEX_SITE_URL:-http://192.168.56.128:3211}}

echo "📡 目标配置: $CONVEX_URL"
echo "🌐 目标站点: $CONVEX_SITE_URL"

# 替换占位符
find /app/public/assets -name "*.js" -exec sed -i \
  "s|__CONVEX_URL_PLACEHOLDER__|$CONVEX_URL|g" {} \;

find /app/public/assets -name "*.js" -exec sed -i \
  "s|__CONVEX_SITE_URL_PLACEHOLDER__|$CONVEX_SITE_URL|g" {} \;

# 替换硬编码的 localhost（后备方案）
find /app/public/assets -name "*.js" -exec sed -i \
  "s|http://localhost:3210|$CONVEX_URL|g" {} \;

find /app/public/assets -name "*.js" -exec sed -i \
  "s|http://localhost:3211|$CONVEX_SITE_URL|g" {} \;

# 服务端代码也需要替换
find /app/server/_ssr -name "*.mjs" -exec sed -i \
  "s|__CONVEX_URL_PLACEHOLDER__|$CONVEX_URL|g" {} \;

find /app/server/_ssr -name "*.mjs" -exec sed -i \
  "s|__CONVEX_SITE_URL_PLACEHOLDER__|$CONVEX_SITE_URL|g" {} \;

find /app/server/_ssr -name "*.mjs" -exec sed -i \
  "s|http://localhost:3210|$CONVEX_URL|g" {} \;

find /app/server/_ssr -name "*.mjs" -exec sed -i \
  "s|http://localhost:3211|$CONVEX_SITE_URL|g" {} \;

echo "✅ 配置替换完成（零代码修改）"
echo "🚀 启动应用..."

# 启动应用
exec node server/index.mjs
