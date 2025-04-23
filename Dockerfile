# Use Node.js LTS
FROM node:18-alpine AS deps

# Install dependencies required for build
RUN apk add --no-cache libc6-compat openssl

# Create working directory
WORKDIR /app

# Copy package files and prisma schema
COPY package.json yarn.lock* package-lock.json* ./
COPY prisma ./prisma

# Install dependencies without running postinstall scripts yet
RUN \
  if [ -f yarn.lock ]; then yarn install --ignore-scripts; \
  elif [ -f package-lock.json ]; then npm ci --ignore-scripts; \
  else npm i --ignore-scripts; \
  fi

# Now generate Prisma client
RUN npx prisma generate

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Setup migrations and generate Prisma client
RUN mkdir -p scripts
COPY scripts/setup-migrations.js ./scripts/
COPY sql.txt ./
RUN node scripts/setup-migrations.js
RUN npx prisma generate

# Build the application
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variables for runtime
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set proper permissions
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT 3000

# Define healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-qO-", "http://localhost:3000/api/health" ]

# Start the application
CMD ["node", "server.js"]
