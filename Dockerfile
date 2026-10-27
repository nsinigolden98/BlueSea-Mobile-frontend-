# BlueSea frontend — Vite SPA served by nginx (port 8080, no published
# ports: the edge nginx in the backend stack proxies APP_DOMAIN here).
# VITE_API_BASE is baked at build time (Vite embeds env into the bundle).

ARG VITE_API_BASE=https://API_DOMAIN_PLACEHOLDER

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . ./
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf:ro
COPY --from=build /app/dist /usr/share/nginx/html:ro
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
