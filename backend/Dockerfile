# ==========================================
# Stage 1: Dependencies Preparation Stage
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm prune --production

# ==========================================
# Stage 2: Production Stage (รัน JavaScript สดๆ)
# ==========================================
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/database ./database
COPY --from=builder /app/routes ./routes

EXPOSE 5000

CMD ["node", "index.js"]