# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

FROM base AS builder
COPY . .
# Skip root "prepare" (lefthook/git hooks) — git is absent in Alpine.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts
ENV NODE_ENV=production
RUN bun run build --filter=@padelski/api

# runner must stay last: compose api and untargeted builds resolve to the final stage.
FROM builder AS migrate
WORKDIR /app/packages/db
CMD ["bun", "run", "db:migrate"]

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001
# read_only rootfs in compose: the Doppler CLI needs a writable config dir.
ENV DOPPLER_CONFIG_DIR=/tmp/.doppler
WORKDIR /app
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' >> /etc/apk/repositories && \
    apk add --no-cache doppler
COPY --from=builder --chown=bun:bun /app/apps/api/dist ./dist
USER bun
EXPOSE 3001
# only compose-owned per-deployment values beat Doppler; Doppler-owned keys like APP_ENV are not shadowed by compose defaults.
CMD ["doppler", "run", "--preserve-env=DB_URL,REDIS_URL,API_CORS_ORIGIN,BETTER_AUTH_URL,NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_API_URL", "--", "bun", "dist/index.js"]
