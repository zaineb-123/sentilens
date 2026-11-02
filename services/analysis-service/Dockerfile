FROM node:20-slim AS deps
WORKDIR /srv
COPY shared ./shared
RUN cd /srv/shared && npm install --omit=dev --no-audit --no-fund
COPY services/analysis-service/package*.json ./services/analysis-service/
WORKDIR /srv/services/analysis-service
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=deps /srv/shared ./shared
COPY --from=deps /srv/services/analysis-service/node_modules ./services/analysis-service/node_modules
COPY services/analysis-service/package*.json ./services/analysis-service/
COPY services/analysis-service/src ./services/analysis-service/src
WORKDIR /srv/services/analysis-service
RUN useradd --create-home appuser && chown -R appuser /srv
USER appuser
EXPOSE 4005
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=6 \
  CMD node -e "require('http').get('http://localhost:4005/health/ready',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/server.js"]
