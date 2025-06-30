# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build shared types
RUN npm run build --workspace=@cryptotracker/shared-types

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build shared types first
RUN npm run build --workspace=@cryptotracker/shared-types

# Build the web app
WORKDIR /app/apps/web

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist

# Set working directory
WORKDIR /app/apps/web

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]