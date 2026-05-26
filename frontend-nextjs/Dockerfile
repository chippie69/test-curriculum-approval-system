# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# สั่งบิวด์ Next.js โปรเจกต์
RUN npm run build

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# คัดลอกไฟล์ที่จำเป็นจาก Stage บิวด์ (ใช้ฟีเจอร์ standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# รันเซิร์ฟเวอร์ Next.js ผ่านไฟล์ server.js ที่สร้างจากโหมด standalone
CMD ["node", "server.js"]