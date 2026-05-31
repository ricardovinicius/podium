FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY apps/api/package.json apps/api/

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
RUN pnpm install --filter ./apps/api... --frozen-lockfile

FROM node:24-alpine AS build
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
RUN pnpm --filter ./apps/api... build

FROM node:24-alpine AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/.env.example ./.env.example
COPY --from=deps /app/apps/api/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/index.js"]
