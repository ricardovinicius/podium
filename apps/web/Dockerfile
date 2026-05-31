FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
RUN pnpm install --filter ./apps/web... --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
RUN pnpm --filter ./apps/web... build

FROM node:20-alpine AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -u 1001

COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/apps/web/next.config.ts ./next.config.ts
COPY --from=build /app/apps/web/.env.example ./.env.example
COPY --from=deps /app/apps/web/node_modules ./node_modules

USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
