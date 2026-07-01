FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && pnpm install --frozen-lockfile || pnpm install
COPY . .
EXPOSE 5001
ENV NODE_ENV=production
CMD ["node", "server.js"]
