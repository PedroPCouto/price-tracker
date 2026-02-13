FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
    if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else echo "No lockfile found. Please add one." && exit 1; \
    fi

FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy source code FIRST
COPY . .

# 2. Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# 3. Generate Prisma Client
# Now that the schema output path is fixed, this will generate correctly into /app/node_modules
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# 4. Build
RUN \
    if [ -f package-lock.json ]; then npm run build; \
    elif [ -f yarn.lock ]; then yarn build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm build; \
    else exit 1; \
    fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# COMMENT OUT OR REMOVE THIS LINE IF YOU DON'T HAVE A PUBLIC FOLDER
# COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]