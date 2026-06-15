FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY packages ./packages

RUN bun install --frozen-lockfile

FROM oven/bun:1 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json bun.lock ./

RUN bun run --cwd packages/frontend build

WORKDIR /app/packages/frontend
EXPOSE 3000

CMD ["sh", "-c", "bun run db:migrate && bun run start"]
