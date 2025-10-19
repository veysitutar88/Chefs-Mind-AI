# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 -G nodejs nodejs

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy server files
COPY server/ ./server/

# Copy frontend-enhanced build
COPY frontend-enhanced/ ./frontend-enhanced/

# Change ownership to non-root user
RUN chown -R nodejs:nodejs .

# Switch to non-root user
USER nodejs

# Expose port (should match the PORT environment variable)
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "run", "dev:server"]