FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json tsconfig.json ./
COPY src ./src

RUN bun install --frozen-lockfile

FROM base AS build
RUN bun run build

FROM oven/bun:1-slim AS release

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "dist/app.js"]