# Claude Code Runner — API Documentation

Base URL: `http://<your-host>:3456`

## Overview

Claude Code Runner is a web-based task runner that executes Claude Code CLI commands via a REST API. Other AI agents, automation scripts, or web services can use this API to:

1. **Create tasks** — send a prompt to Claude Code and have it execute autonomously
2. **Monitor tasks** — poll for status or stream live output via WebSocket
3. **Manage tasks** — stop, delete, or list tasks

### How It Works

When you create a task:
- **Without a model**: runs `claude --dangerously-skip-permissions` (uses default Claude Code)
- **With a model**: runs `ollama launch claude --model <model> -- --dangerously-skip-permissions` (uses ollama with the specified model)

The server spawns a real terminal (PTY), types the command, feeds your prompt, and captures all output.

---

## Quick Start for AI Agents

### Step 1: Create a Task

```bash
curl -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hello world function in index.js",
    "workingDir": "/path/to/project"
  }'
```

### Step 2: Poll Until Done

```bash
curl http://localhost:3456/api/tasks/<task-id>/status
```

Response includes `"done": true` when the task is finished.

### Step 3: Get the Output

```bash
curl http://localhost:3456/api/tasks/<task-id>
```

Response includes the full terminal `output` field.

---

## Authentication

Authentication is **optional**. To enable it, set the `API_KEY` environment variable before starting the server:

```bash
API_KEY=mysecretkey node server.js
```

When `API_KEY` is set, every API request must include the key using **one** of these methods:

| Method | Header |
|--------|--------|
| Bearer token | `Authorization: Bearer mysecretkey` |
| Direct header | `X-API-Key: mysecretkey` |

If `API_KEY` is not set, all endpoints are publicly accessible.

**401 response when key is wrong or missing:**
```json
{ "error": "Unauthorized: invalid or missing API key" }
```

---

## Endpoints

### List Models

Get all available AI models.

```
GET /api/models
```

**Example request:**
```bash
curl http://localhost:3456/api/models
```

**Response `200 OK`:**
```json
[
  { "id": "minimax-m2.7:cloud", "name": "Minimax M2.7 Cloud" },
  { "id": "qwen3.5:397b-cloud", "name": "Qwen 3.5 397B Cloud" }
]
```

---

### Add a Model

Register a new model at runtime.

```
POST /api/models
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The model identifier passed to `ollama launch claude --model <id>` |
| `name` | string | No | Display name. Defaults to the `id` value |

**Example request:**
```bash
curl -X POST http://localhost:3456/api/models \
  -H "Content-Type: application/json" \
  -d '{"id": "gpt-4o", "name": "GPT-4o"}'
```

**Response `201 Created`:**
```json
{ "id": "gpt-4o", "name": "GPT-4o" }
```

**Response `409 Conflict`** if the model already exists:
```json
{ "error": "Model already exists" }
```

---

### Remove a Model

Remove a model from the available list.

```
DELETE /api/models/:id
```

**Example request:**
```bash
curl -X DELETE http://localhost:3456/api/models/gpt-4o
```

**Response `200 OK`:**
```json
{ "success": true }
```

**Response `404 Not Found`:**
```json
{ "error": "Model not found" }
```

> **Note:** Models added at runtime are stored in memory and will be reset when the server restarts. To persist models, use the `MODELS` environment variable.

---

### Create a Task

Start a new Claude Code task.

```
POST /api/tasks
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | **Yes** | The task instruction for Claude Code |
| `model` | string | No | Model ID from `GET /api/models`. When set, runs `ollama launch claude --model <value> -- --dangerously-skip-permissions`. When omitted, runs `claude --dangerously-skip-permissions` (default Claude Code) |
| `workingDir` | string | No | Absolute path to the working directory. Defaults to the server's `cwd` |
| `callbackUrl` | string | No | Webhook URL. Receives a POST when the task status changes |

**Example 1 — Default Claude Code (no model):**
```bash
curl -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hello world function in index.js",
    "workingDir": "/Users/myuser/myproject"
  }'
```
This runs: `claude --dangerously-skip-permissions`

**Example 2 — With a specific model (via ollama):**
```bash
curl -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hello world function in index.js",
    "model": "minimax-m2.7:cloud",
    "workingDir": "/Users/myuser/myproject"
  }'
```
This runs: `ollama launch claude --model minimax-m2.7:cloud -- --dangerously-skip-permissions`

**Example 3 — With webhook callback:**
```bash
curl -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Fix all TypeScript errors",
    "model": "minimax-m2.7:cloud",
    "workingDir": "/Users/myuser/myproject",
    "callbackUrl": "https://mysite.com/webhooks/claude"
  }'
```

**Response `201 Created`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "prompt": "Create a hello world function in index.js",
  "workingDir": "/Users/myuser/myproject",
  "callbackUrl": null,
  "model": "minimax-m2.7:cloud",
  "status": "running",
  "output": "",
  "createdAt": "2026-03-23T10:00:00.000Z",
  "startedAt": "2026-03-23T10:00:00.001Z",
  "finishedAt": null,
  "exitCode": null
}
```

**Task statuses:**

| Status | Meaning |
|--------|---------|
| `queued` | Created, not started yet |
| `running` | Claude Code is executing |
| `completed` | Finished with exit code 0 |
| `failed` | Finished with non-zero exit code |
| `stopped` | Manually stopped via the stop endpoint |

---

### List All Tasks

```
GET /api/tasks
```

**Example request:**
```bash
curl http://localhost:3456/api/tasks
```

**Response `200 OK`:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "prompt": "Create a hello world function...",
    "status": "completed",
    "createdAt": "2026-03-23T10:00:00.000Z",
    "startedAt": "2026-03-23T10:00:00.001Z",
    "finishedAt": "2026-03-23T10:02:30.000Z"
  }
]
```

Results are sorted newest first. The `output` field is omitted in list responses — use [Get Task](#get-a-task) for full output.

---

### Get a Task

Fetch full details including terminal output.

```
GET /api/tasks/:id
```

**Example request:**
```bash
curl http://localhost:3456/api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "prompt": "Create a hello world function in index.js",
  "workingDir": "/Users/myuser/myproject",
  "callbackUrl": null,
  "model": "minimax-m2.7:cloud",
  "status": "completed",
  "output": "...(full terminal output with ANSI codes)...",
  "createdAt": "2026-03-23T10:00:00.000Z",
  "startedAt": "2026-03-23T10:00:00.001Z",
  "finishedAt": "2026-03-23T10:02:30.000Z",
  "exitCode": 0
}
```

**Response `404 Not Found`:**
```json
{ "error": "Task not found" }
```

---

### Get Task Status

Lightweight check — returns only the status fields, no terminal output. Use this for polling instead of the full [Get Task](#get-a-task) endpoint.

```
GET /api/tasks/:id/status
```

**Example request:**
```bash
curl http://localhost:3456/api/tasks/a1b2c3d4-.../status
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "done": true,
  "exitCode": 0,
  "createdAt": "2026-03-23T10:00:00.000Z",
  "startedAt": "2026-03-23T10:00:00.001Z",
  "finishedAt": "2026-03-23T10:02:30.000Z"
}
```

The `done` field is `true` when `status` is `completed`, `failed`, or `stopped`.

---

### Stop a Task

Stop a running task.

```
POST /api/tasks/:id/stop
```

**Example request:**
```bash
curl -X POST http://localhost:3456/api/tasks/a1b2c3d4-.../stop
```

**Response `200 OK`:** Returns the updated task object with `status: "stopped"`.

**Response `400 Bad Request`** if the task is not running:
```json
{ "error": "Task is not running" }
```

---

### Delete a Task

Remove a task from memory. If still running, it will be killed first.

```
DELETE /api/tasks/:id
```

**Example request:**
```bash
curl -X DELETE http://localhost:3456/api/tasks/a1b2c3d4-...
```

**Response `200 OK`:**
```json
{ "success": true }
```

---

## Webhooks

If you pass a `callbackUrl` when creating a task, the server will send a `POST` request to that URL whenever the task status changes (`running`, `completed`, `failed`, `stopped`).

**Webhook payload** is identical to the [Get Task](#get-a-task) response body:

```json
{
  "id": "a1b2c3d4-...",
  "prompt": "...",
  "workingDir": "...",
  "callbackUrl": "https://mysite.com/webhooks/claude",
  "model": "minimax-m2.7:cloud",
  "status": "completed",
  "output": "...(full terminal output)...",
  "createdAt": "...",
  "startedAt": "...",
  "finishedAt": "...",
  "exitCode": 0
}
```

Your webhook endpoint must accept `POST` with `Content-Type: application/json`. The server does not retry on failure.

**Example webhook handler (Express.js):**
```js
app.post('/webhooks/claude', express.json(), (req, res) => {
  const task = req.body;
  console.log(`Task ${task.id} is now ${task.status}`);
  if (task.status === 'completed') {
    // do something with task.output
  }
  res.sendStatus(200);
});
```

---

## Real-time Output via WebSocket

For live streaming of terminal output, connect via WebSocket:

```
ws://<your-host>:3456
```

**Subscribe to a task:**
```js
const ws = new WebSocket('ws://localhost:3456');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'subscribe', taskId: 'a1b2c3d4-...' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'output') {
    // msg.data contains raw terminal bytes (ANSI escape codes included)
    process.stdout.write(msg.data);
  }

  if (msg.type === 'status') {
    console.log('Status:', msg.status);
  }
};
```

**Message types received from server:**

| `type` | Fields | Description |
|--------|--------|-------------|
| `status` | `status`, `startedAt?`, `finishedAt?`, `exitCode?` | Task status changed |
| `output` | `data` | Raw terminal output chunk |

**Message types you can send to server:**

| `type` | Fields | Description |
|--------|--------|-------------|
| `subscribe` | `taskId` | Start receiving updates for a task |
| `unsubscribe` | — | Stop receiving updates |
| `input` | `data` | Send keyboard input to the terminal |
| `resize` | `cols`, `rows` | Resize the terminal |

---

## Complete Examples for AI Agents

### Python — Create and Wait for a Task

```python
import requests
import time

BASE = "http://localhost:3456"
API_KEY = None  # Set if API_KEY is enabled on server

headers = {"Content-Type": "application/json"}
if API_KEY:
    headers["Authorization"] = f"Bearer {API_KEY}"

# 1. Create a task (default Claude Code)
res = requests.post(f"{BASE}/api/tasks", json={
    "prompt": "Add error handling to all API routes",
    "workingDir": "/Users/myuser/myproject"
}, headers=headers)
task = res.json()
task_id = task["id"]
print(f"Task created: {task_id}")

# 2. Poll until done
while True:
    time.sleep(3)
    status = requests.get(f"{BASE}/api/tasks/{task_id}/status", headers=headers).json()
    print(f"Status: {status['status']}")
    if status["done"]:
        break

# 3. Get full output
result = requests.get(f"{BASE}/api/tasks/{task_id}", headers=headers).json()
print(f"Exit code: {result['exitCode']}")
print(f"Output: {result['output']}")
```

### Python — Create a Task with a Specific Model

```python
res = requests.post(f"{BASE}/api/tasks", json={
    "prompt": "Refactor the database module to use connection pooling",
    "model": "minimax-m2.7:cloud",
    "workingDir": "/Users/myuser/myproject"
}, headers=headers)
```

### JavaScript/Node.js — Create and Wait for a Task

```js
const BASE = 'http://localhost:3456';
const KEY = null; // Set if API_KEY is enabled on server

async function runClaude(prompt, workingDir, model) {
  // 1. Create the task
  const createRes = await fetch(`${BASE}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KEY ? { 'Authorization': `Bearer ${KEY}` } : {}),
    },
    body: JSON.stringify({
      prompt,
      workingDir,
      model: model || undefined  // omit for default Claude Code
    }),
  });

  const task = await createRes.json();
  console.log('Task created:', task.id);

  // 2. Poll until done
  while (true) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(`${BASE}/api/tasks/${task.id}/status`, {
      headers: KEY ? { 'Authorization': `Bearer ${KEY}` } : {},
    });
    const status = await statusRes.json();
    console.log(`Status: ${status.status}`);

    if (status.done) {
      // 3. Get full output
      const resultRes = await fetch(`${BASE}/api/tasks/${task.id}`, {
        headers: KEY ? { 'Authorization': `Bearer ${KEY}` } : {},
      });
      return await resultRes.json();
    }
  }
}

// Use default Claude Code
await runClaude('Add a README.md', '/Users/myuser/myproject');

// Use a specific model via ollama
await runClaude('Add a README.md', '/Users/myuser/myproject', 'minimax-m2.7:cloud');
```

### cURL — Full Workflow

```bash
# 1. Create task (default Claude Code)
TASK_ID=$(curl -s -X POST http://localhost:3456/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List all files", "workingDir": "/tmp/test"}' \
  | jq -r '.id')

echo "Task: $TASK_ID"

# 2. Poll until done
while true; do
  STATUS=$(curl -s http://localhost:3456/api/tasks/$TASK_ID/status)
  DONE=$(echo $STATUS | jq -r '.done')
  echo "Status: $(echo $STATUS | jq -r '.status')"
  [ "$DONE" = "true" ] && break
  sleep 3
done

# 3. Get output
curl -s http://localhost:3456/api/tasks/$TASK_ID | jq '.output'
```

---

## Stall Detection & AI Auto-Response

When Claude Code is running a task and stops producing output for a configurable period (default 45 seconds), the server automatically:

1. **Detects the stall** — no terminal output for `STALL_TIMEOUT_MS` milliseconds
2. **Analyzes the situation** — calls the Anthropic Claude API to read the last terminal output and understand what Claude Code is stuck on
3. **Auto-responds** — sends an appropriate response to unblock Claude Code (e.g., "yes" for confirmation prompts, instructions to try a different approach for errors)
4. **Logs everything** — all stall responses are recorded in `stallResponses` on the task object

### How It Works

- After Claude starts working and output stops, a timer counts down
- When the timer fires, the last ~2000 characters of terminal output are sent to Claude Sonnet for analysis
- The AI determines the action: `press_yes`, `press_no`, `press_enter`, `type_text`, `send_instruction`, or `skip`
- For `send_instruction`, the AI tells Claude Code to **find and suggest solutions**, not execute blindly
- Max 5 auto-responses per task to prevent infinite loops
- Each retry uses a longer timeout (1.5x) if the previous analysis was uncertain

### Stall Response in Task Object

The `GET /api/tasks/:id` response now includes a `stallResponses` array:

```json
{
  "id": "a1b2c3d4-...",
  "status": "completed",
  "stallResponses": [
    {
      "timestamp": "2026-03-23T10:01:30.000Z",
      "situation": "Claude is asking for confirmation to overwrite existing files",
      "action": "press_yes",
      "response": null,
      "confidence": 0.95
    }
  ]
}
```

### WebSocket Stall Notifications

When a stall is detected and responded to, subscribers receive:

```json
{
  "type": "stall_response",
  "situation": "Claude is asking for confirmation to proceed",
  "action": "press_yes",
  "response": null
}
```

### Requirements

- Set `STALL_ANALYSIS_API_KEY` or `ANTHROPIC_API_KEY` environment variable with a valid Anthropic API key
- Without an API key, stall detection is disabled (tasks still run normally, just no auto-response)

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3456` | Port the server listens on |
| `API_KEY` | *(none)* | If set, all API requests require this key |
| `MODELS` | *(none)* | Comma-separated list of model IDs to make available (e.g. `minimax-m2.7:cloud,qwen3.5:397b-cloud,gpt-4o`). If not set, uses built-in defaults |
| `STALL_DETECTION` | `true` | Set to `false` to disable stall detection |
| `STALL_TIMEOUT_MS` | `45000` | Milliseconds of idle output before triggering stall analysis |
| `STALL_MAX_RETRIES` | `5` | Maximum auto-responses per task |
| `STALL_ANALYSIS_API_KEY` | *(none)* | Anthropic API key for stall analysis (falls back to `ANTHROPIC_API_KEY`) |
| `STALL_ANALYSIS_MODEL` | `claude-sonnet-4-20250514` | Model used for analyzing stalls |
