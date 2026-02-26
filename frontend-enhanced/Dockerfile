# ── Stage 1: Install all dependencies ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: Production runner ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 -G nodejs nextjs

# Install production dependencies only (deterministic via lock file)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts and config
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public      ./public
COPY --from=builder /app/next.config.* ./

# Set correct ownership
RUN chown -R nextjs:nodejs .

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
