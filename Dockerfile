# ─── Stage 1: Base ──────────────────────────────────────────
FROM node:lts-slim AS base
WORKDIR /app

# ─── Stage 2: Build dependencies ───────────────────────────
FROM base AS deps
COPY package.json ./
# Install all dependencies (required for building the project)
RUN npm install

# ─── Stage 3: Build the application ────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── Stage 4: Production dependencies ──────────────────────
FROM base AS prod-deps
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
# Prune development dependencies to keep the image small
RUN npm prune --production

# ─── Stage 5: Runtime (production) ─────────────────────────
FROM node:lts-slim AS runtime
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
