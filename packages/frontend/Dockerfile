FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/frontend/package.json packages/frontend/package.json

RUN bun install --frozen-lockfile

FROM oven/bun:1 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY package.json bun.lock ./
COPY packages/frontend ./packages/frontend

RUN bun run --cwd packages/frontend build

WORKDIR /app/packages/frontend
EXPOSE 3000

CMD ["sh", "-c", "bun run db:migrate && bun run start"]
