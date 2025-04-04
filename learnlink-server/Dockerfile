# Stage 1: Build stage
FROM node:18-bullseye AS builder

WORKDIR /app

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-1.1.x,debian-openssl-3.0.x
ENV OPENSSL_CONF=/etc/ssl/

# Install system dependencies with retry logic
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update || (rm -rf /var/lib/apt/lists/* && apt-get update) && \
    apt-get install -y --no-install-recommends \
    libvips-dev \
    libheif-dev \
    libssl-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
    libheif-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy from build stage (FIXED: using 'builder' instead of 'build')
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose ports
EXPOSE 2020 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:2020/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]