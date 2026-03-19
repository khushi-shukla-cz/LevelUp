# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# Install runtime libs for healthcheck + Prisma engines
RUN apk add --no-cache wget openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "dev"]

# ─── Builder Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# ─── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime libs for healthcheck + Prisma engines
RUN apk add --no-cache wget openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

USER nodejs

EXPOSE 4000

# Sync schema, seed data, then start server
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node src/index.js"]
