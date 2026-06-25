# ─── Stage 1: Base ──────────────────────────────────────────
FROM oven/bun:1-slim AS base
WORKDIR /app

# ─── Stage 2: Production dependencies ──────────────────────
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# ─── Stage 3: All dependencies + build ─────────────────────
FROM base AS build-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN bun run build

# ─── Stage 4: Runtime (production) ─────────────────────────
FROM oven/bun:1-slim AS runtime

# Security: run as non-root user
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

WORKDIR /app

# Copy only what's needed
COPY --from=prod-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Environment
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

# Health check — Docker will mark container as unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun -e "fetch('http://localhost:4321').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Switch to non-root user
USER appuser

CMD ["bun", "./dist/server/entry.mjs"]
