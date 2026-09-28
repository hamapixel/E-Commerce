FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:24-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3001/login').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3001"]
