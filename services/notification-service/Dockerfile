FROM node:20-slim AS deps
WORKDIR /srv
COPY shared ./shared
RUN cd /srv/shared && npm install --omit=dev --no-audit --no-fund
COPY services/notification-service/package*.json ./services/notification-service/
WORKDIR /srv/services/notification-service
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=deps /srv/shared ./shared
COPY --from=deps /srv/services/notification-service/node_modules ./services/notification-service/node_modules
COPY services/notification-service/package*.json ./services/notification-service/
COPY services/notification-service/src ./services/notification-service/src
WORKDIR /srv/services/notification-service
RUN useradd --create-home appuser && chown -R appuser /srv
USER appuser
EXPOSE 4007
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=6 \
  CMD node -e "require('http').get('http://localhost:4007/health/ready',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/server.js"]
