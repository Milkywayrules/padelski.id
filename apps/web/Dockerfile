# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

FROM base AS builder
COPY . .
# Skip root "prepare" (lefthook/git hooks) — git is absent in Alpine.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Next.js inlines NEXT_PUBLIC_* into the client bundle at build time, so Coolify
# passes the per-deployment URLs as build args.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN bun run build --filter=@padelski/web
RUN mkdir -p apps/web/public

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=bun:bun /app/apps/web/public ./apps/web/public
# Writable mount point for runtime cache when compose uses read_only + tmpfs.
RUN mkdir -p apps/web/.next/cache && chown -R bun:bun apps/web/.next
USER bun
EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
