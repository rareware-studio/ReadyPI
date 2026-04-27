# =============================================================================
# ReadyPI API — Production Dockerfile
# Multi-stage build | node:20-alpine | PM2 process manager | Port 8080
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Dependency installation
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++ linux-headers

# Copy package manifests
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci --ignore-scripts && \
    npm rebuild bcrypt --build-from-source

# ---------------------------------------------------------------------------
# Stage 2: Production pruning
# ---------------------------------------------------------------------------
FROM node:20-alpine AS pruner

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Prune dev dependencies for smaller production image
RUN npm prune --production

# ---------------------------------------------------------------------------
# Stage 3: Production runtime
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runtime

# Install PM2 globally, dumb-init for proper signal handling, and curl for healthcheck
RUN apk add --no-cache dumb-init curl && \
    npm install -g pm2@latest && \
    npm cache clean --force

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy production node_modules from pruner stage
COPY --from=pruner /usr/src/app/node_modules ./node_modules

# Copy application source code
COPY . .

# Copy PM2 ecosystem config
COPY ecosystem.config.cjs ./ecosystem.config.cjs

# Create non-root user for security
RUN addgroup -g 1001 -S readypi && \
    adduser -S readypi -u 1001 -G readypi && \
    mkdir -p /usr/src/app/logs && \
    chown -R readypi:readypi /usr/src/app

# Switch to non-root user
USER readypi

# Cloud Run provides PORT as env var; expose 8080 as default
EXPOSE 8080

# Health check — Cloud Run uses HTTP health checks on the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Use dumb-init to handle PID 1 and forward signals to PM2
ENTRYPOINT ["dumb-init", "--"]

# Start application with PM2 (no-daemon mode for container compatibility)
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
