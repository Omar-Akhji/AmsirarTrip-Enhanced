# ─── Stage 1: Base (using Bun) ─────────────────────────────
FROM oven/bun:1-slim AS base
WORKDIR /app

# ─── Stage 2: Production dependencies (using Bun) ──────────
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# ─── Stage 3: All dependencies + build (using Bun) ─────────
FROM base AS build-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM build-deps AS build
ARG PUBLIC_RECAPTCHA_SITE_KEY
ENV PUBLIC_RECAPTCHA_SITE_KEY=$PUBLIC_RECAPTCHA_SITE_KEY
COPY . .
RUN bun run build

# ─── Stage 4: Runtime (using Node) ─────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app

# Copy production node_modules and built dist folder
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

# Environment
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

# Health check — Docker will mark container as unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:4321').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Switch to non-root user
USER node

CMD ["node", "./dist/server/entry.mjs"]
