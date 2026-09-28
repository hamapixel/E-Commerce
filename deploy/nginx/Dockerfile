FROM nginx:1.29-alpine

COPY api.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/api/v1/health/ || exit 1
