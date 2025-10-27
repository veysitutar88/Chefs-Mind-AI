# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build:server

# Fix ESM imports by adding .js extensions safely (skip already-suffixed imports)
RUN node scripts/fix-esm-extensions.mjs dist

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 -G nodejs nodejs

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Provide runtime alias for @shared/* by copying compiled shared into node_modules/@shared
# This lets imports like '@shared/schema' or '@shared/schema.js' resolve at runtime
RUN mkdir -p node_modules/@shared && cp -r dist/shared/* node_modules/@shared/
# Make @shared a package for Node's ESM resolver
RUN printf '{\n  "name": "@shared",\n  "version": "1.0.0",\n  "type": "module"\n}\n' > node_modules/@shared/package.json

# Copy frontend-enhanced build
COPY frontend-enhanced/ ./frontend-enhanced/

# Ensure correct ownership of application files
RUN chown -R nodejs:nodejs .

# Switch to the non-root user
USER nodejs

# Expose the application port
EXPOSE 5000

# Set the production environment
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "dist/server/index.js"]