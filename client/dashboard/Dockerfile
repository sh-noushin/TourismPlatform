FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

# @angular/build:application emits browser assets under dist/<project>/browser.
COPY --from=build /app/dist/dashboard/browser /usr/share/nginx/html

# The nginx image runs every /docker-entrypoint.d/*.sh before starting the server;
# this one writes runtime-config.js from DASHBOARD_API_BASE_URL so one image can be
# pointed at any API host without rebuilding.
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
