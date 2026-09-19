FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssh-client tmux ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.mjs targets.example.json ./
USER node
ENV TERMINAL_HOST=0.0.0.0 PORT=8787 TERMINAL_TARGETS_FILE=/app/targets.example.json
EXPOSE 8787
CMD ["node", "server.mjs"]
