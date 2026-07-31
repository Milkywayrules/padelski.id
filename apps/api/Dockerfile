FROM oven/bun:1.3-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/activity-log/package.json ./packages/activity-log/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/domain/package.json ./packages/domain/
COPY packages/email/package.json ./packages/email/
COPY packages/env/package.json ./packages/env/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ws-protocol/package.json ./packages/ws-protocol/
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build --filter=@padelski/api

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
