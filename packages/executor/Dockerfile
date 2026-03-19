# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS development

RUN apk add --no-cache wget docker-cli

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "run", "dev"]

# ─── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache wget docker-cli

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=nodejs:nodejs src ./src

# Executor needs to call docker — runs as root for docker socket access
# In production, use docker socket proxy for security

EXPOSE 5000
CMD ["node", "src/index.js"]
