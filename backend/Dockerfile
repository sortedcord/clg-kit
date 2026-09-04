FROM node:22-bookworm-slim
WORKDIR /app
COPY backend/server.mjs ./backend/server.mjs
RUN mkdir -p /app/backend/data && chown -R node:node /app
USER node
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "backend/server.mjs"]
