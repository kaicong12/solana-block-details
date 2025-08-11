ARG REGISTRY="docker.io"
FROM $REGISTRY/node:22.14 AS deps
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy lockfile + manifest first for caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev + prod) for building
RUN pnpm install --frozen-lockfile

# ---------- Build stage ----------
ARG REGISTRY="docker.io"
FROM $REGISTRY/node:22.14 AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- Production stage ----------
ARG REGISTRY="docker.io"
FROM $REGISTRY/node:22.14 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy everything from builder (you could trim further if you want smaller images)
COPY --from=builder /app ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/ || exit 1

# Start Next.js
CMD ["pnpm", "start"]
