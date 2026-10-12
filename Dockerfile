# Production Multi-Stage Dockerfile for Jev Model Portal
# Stage 1: Build & Assets Compiler
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY scripts/ ./scripts/
COPY public/ ./public/
COPY docs/ ./docs/
RUN node scripts/build.js

# Stage 2: Minimal Production Runtime
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as unprivileged node user
USER node

# Copy only production artifacts and necessary code
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node docs/ ./docs/
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

# Production Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
