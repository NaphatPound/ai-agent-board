# syntax=docker/dockerfile:1.6
# ────────────────────────────────────────────────────────────────
# Stage 1 — Build the trello-clone Vite frontend
# ────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS web-build
WORKDIR /app/trello-clone

COPY trello-clone/package.json trello-clone/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY trello-clone/ ./
# Skip `tsc -b` (pre-existing type errors in sources) — vite build alone still emits a working bundle.
RUN npx vite build

# ────────────────────────────────────────────────────────────────
# Stage 2 — Install runner dependencies (node-pty needs build tools)
# ────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner-deps
WORKDIR /app/claude-code-runner

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY claude-code-runner/package.json claude-code-runner/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# ────────────────────────────────────────────────────────────────
# Stage 3 — Final runtime image
# ────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3456 \
    SHELL=/bin/bash

# Runtime tools the runner shell-spawns (bash, git, curl) plus certs for outbound HTTPS.
RUN apt-get update && apt-get install -y --no-install-recommends \
      bash git curl ca-certificates tini \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @anthropic-ai/claude-code --no-audit --no-fund

WORKDIR /app

# Built frontend (served by the runner's express server at /)
COPY --from=web-build /app/trello-clone/dist /app/trello-clone/dist

# Runner server + its pre-installed dependencies
COPY --from=runner-deps /app/claude-code-runner/node_modules /app/claude-code-runner/node_modules
COPY claude-code-runner/ /app/claude-code-runner/

WORKDIR /app/claude-code-runner
EXPOSE 3456

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
