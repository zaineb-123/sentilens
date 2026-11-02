FROM node:20-slim AS deps
WORKDIR /srv
COPY shared ./shared
RUN cd /srv/shared && npm install --omit=dev --no-audit --no-fund
COPY services/survey-service/package*.json ./services/survey-service/
WORKDIR /srv/services/survey-service
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=deps /srv/shared ./shared
COPY --from=deps /srv/services/survey-service/node_modules ./services/survey-service/node_modules
COPY services/survey-service/package*.json ./services/survey-service/
COPY services/survey-service/src ./services/survey-service/src
WORKDIR /srv/services/survey-service
RUN useradd --create-home appuser && chown -R appuser /srv
USER appuser
EXPOSE 4003
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=6 \
  CMD node -e "require(\"http\").get(\"http://localhost:4003/health/ready\",r=>process.exit(r.statusCode===200?0:1)).on(\"error\",()=>process.exit(1))"
CMD ["node", "src/server.js"]
