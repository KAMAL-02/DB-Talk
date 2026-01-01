# Base
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build 

# Runtime 
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# prod deps
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm install -g pnpm \
  && pnpm prune --prod \
  && npm uninstall -g pnpm \
  && rm -rf /root/.npm /root/.pnpm-store

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
