FROM node:23-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

ENV POSTGRES_HOST="postgres"
ENV POSTGRES_PASS="postgres"
ENV REDIS_URL="redis://default:@redis:6379"

WORKDIR /app
COPY . /app

RUN pnpm run build

CMD [ "pnpm", "run", "test" ]
