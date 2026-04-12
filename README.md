# AI Agent Board

Merged distribution of **trello-clone** (React + Vite frontend) and
**Claude-Code-Runner** (Express + node-pty backend) served from a single
Express process behind one port.

```
ai-agent-borad/
├── Dockerfile           — multi-stage build (Vite → node-pty → runtime)
├── docker-compose.yml   — one-command launch
├── trello-clone/        — React frontend sources (built into dist at image-build time)
└── claude-code-runner/  — Express server + WebSocket PTY bridge
```

## Run with one command

```bash
docker compose up --build
```

Then open <http://localhost:3456> — the Trello-style board is served at `/`,
and the raw runner terminal UI is reachable at `/runner`.

To rebuild from scratch after source changes:

```bash
docker compose up --build --force-recreate
```

To stop:

```bash
docker compose down
```

## Without docker-compose

```bash
docker build -t ai-agent-board .
docker run --rm -p 3456:3456 ai-agent-board
```

## Configuration

Environment variables (set in `docker-compose.yml` or via `-e` on `docker run`):

| Variable              | Default  | Purpose                                         |
| --------------------- | -------- | ----------------------------------------------- |
| `PORT`                | `3456`   | HTTP + WebSocket port                           |
| `API_KEY`             | *(none)* | Bearer token required for `/api/*` requests     |
| `ANTHROPIC_API_KEY`   | *(none)* | Enables Claude-powered stall detection          |
| `STALL_DETECTION`     | `true`   | Set `false` to disable auto-unsticking          |
| `MODELS`              | *(none)* | Comma-separated override of the models dropdown |

## How the two projects are wired together

* At build time the Vite app is compiled to `trello-clone/dist`.
* The runner's Express server (`claude-code-runner/server.js`) serves that
  `dist/` directory at `/` and keeps its own UI at `/runner`.
* `/api/*` continues to hit the runner REST API.
* `/ollama-api/*` is reverse-proxied to `https://ollama.com/api/*` so the
  frontend's AI calls work from the same origin (no CORS).
* The WebSocket server attaches to the same HTTP port, so the browser's
  `ws://<host>:3456` terminal stream works without a second port.

## Notes

* The container ships with `@anthropic-ai/claude-code` globally installed so
  the runner can spawn `claude` inside a PTY. Provide your Anthropic API key
  via `ANTHROPIC_API_KEY` to actually run Claude.
* A named `workspace` volume is mounted at `/workspace` — point the runner's
  task `workingDir` there if you want generated files to survive restarts.
