FROM node:20-slim AS deps
WORKDIR /srv
COPY shared ./shared
RUN cd /srv/shared && npm install --omit=dev --no-audit --no-fund
COPY services/api-gateway/package*.json ./services/api-gateway/
WORKDIR /srv/services/api-gateway
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=deps /srv/shared ./shared
COPY --from=deps /srv/services/api-gateway/node_modules ./services/api-gateway/node_modules
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY services/api-gateway/src ./services/api-gateway/src
# The gateway's Swagger aggregation `require`s each service's src/openapi.js directly
# (see src/services/mergedOpenApi.js) - those plain .js files (no deps of their own) are
# copied in here too, purely for that static merge; the gateway never executes any other
# code from these services.
COPY services/auth-service/src/openapi.js ./services/auth-service/src/openapi.js
COPY services/organization-service/src/openapi.js ./services/organization-service/src/openapi.js
COPY services/survey-service/src/openapi.js ./services/survey-service/src/openapi.js
COPY services/feedback-service/src/openapi.js ./services/feedback-service/src/openapi.js
COPY services/analytics-service/src/openapi.js ./services/analytics-service/src/openapi.js
COPY services/notification-service/src/openapi.js ./services/notification-service/src/openapi.js
WORKDIR /srv/services/api-gateway
RUN useradd --create-home appuser && chown -R appuser /srv
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=6 \
  CMD node -e "require('http').get('http://localhost:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/server.js"]
