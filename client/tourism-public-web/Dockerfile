FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# API_BASE_URL is only read at request time (lib/api/client.ts, app/api/proxy route),
# so it is deliberately not a build arg -- the same image works against any API host.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `output: "standalone"` bundles server.js plus the traced dependencies; public/ and
# .next/static are not included in that trace and must be copied alongside it.
COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
