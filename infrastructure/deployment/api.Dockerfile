FROM node:24.21.0-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/*/package.json packages/
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @platform/api build
CMD ["pnpm","--filter","@platform/api","start"]
