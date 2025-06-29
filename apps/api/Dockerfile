# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build shared types
RUN npm run build --workspace=@cryptotracker/shared-types

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build shared types first
RUN npm run build --workspace=@cryptotracker/shared-types

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist

# Set working directory
WORKDIR /app/apps/api

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main"]