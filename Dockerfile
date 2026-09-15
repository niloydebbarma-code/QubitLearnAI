# ==============================================================================
# QubitLearn AI - Multi-Stage Production Dockerfile
# Interactive Quantum Computing & Algorithm Learning Platform
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build Vite Frontend & Static Assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY qubitlearn-app/package*.json ./

# Install all dependencies (including devDependencies for TypeScript & Vite)
RUN npm ci

# Copy full application source code
COPY qubitlearn-app/ ./

# Build production client bundle
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runtime Environment
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY qubitlearn-app/package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built frontend from Stage 1
COPY --from=builder /app/dist ./dist

# Copy backend server files & configurations
COPY qubitlearn-app/server/ ./server/
COPY qubitlearn-app/server.ts ./server.ts
COPY qubitlearn-app/tsconfig.json ./tsconfig.json
COPY qubitlearn-app/course_documents/ ./course_documents/
COPY qubitlearn-app/challenge_documents/ ./challenge_documents/
COPY qubitlearn-app/assessment_documents/ ./assessment_documents/
COPY qubitlearn-app/research_documents/ ./research_documents/

# Expose standard application port (HTTP + WebSocket)
EXPOSE 3000

# Healthcheck to verify system resilience
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start Full-Stack Express Server via tsx
CMD ["tsx", "server.ts"]
