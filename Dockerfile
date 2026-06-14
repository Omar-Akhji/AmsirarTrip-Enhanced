FROM oven/bun:1 AS base
WORKDIR /app

# ─── production dependencies ──────────────────────────────
FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# ─── all dependencies + build ──────────────────────────────
FROM base AS build-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM build-deps AS build
COPY . .
RUN bun run build

# ─── runtime ────────────────────────────────────────────────
FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["bun", "./dist/server/entry.mjs"]
