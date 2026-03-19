# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ─── Builder Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:4000
ARG VITE_WS_URL=ws://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ─── Production Stage (Nginx) ──────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
