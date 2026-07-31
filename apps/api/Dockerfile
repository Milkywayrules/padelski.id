# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14-alpine AS base
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
# Skip root "prepare" (lefthook/git hooks) — git is absent in Alpine.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN rm -rf apps/*/node_modules packages/*/node_modules && \
    bun install --frozen-lockfile --ignore-scripts
ENV NODE_ENV=production
RUN bun run build --filter=@padelski/api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app
COPY --from=builder --chown=bun:bun /app/apps/api/dist ./dist
USER bun
EXPOSE 3001
CMD ["bun", "dist/index.js"]
