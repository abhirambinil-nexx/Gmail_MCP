# gmail-mcp

An MCP (Model Context Protocol) server that exposes Gmail as a set of tools for AI coding assistants — built for use inside VS Code with Claude or Copilot.

## Features

- **6 Zod-validated MCP tools:** `listEmails`, `readEmail`, `searchEmail`, `sendEmail`, `createDraft`, `getLabels`
- **MCP stdio protocol** — routes tool calls through a central tool registry to the Gmail API
- **Google OAuth** — dedicated Express server handles the OAuth flow separately from the MCP process
- **Encrypted email handling** — bifurcated cryptography for storing/retrieving email content securely
- **Audit logging** — every tool call is logged to `tool_logs` in MySQL
- **Token & response caching** — Redis used for OAuth token storage and API response caching

## Tech Stack

**Protocol:** MCP (stdio transport)
**Runtime:** Node.js
**Validation:** Zod
**Database:** MySQL (audit logs, OAuth tokens)
**Cache:** Redis
**Auth:** Google OAuth 2.0 (Gmail API scopes)

## Architecture

```
AI Client (Claude / Copilot, via VS Code)
        │  MCP stdio
        ▼
   Tool Registry ──► listEmails / readEmail / searchEmail /
                     sendEmail / createDraft / getLabels
        │
        ▼
   Gmail API
        │
        ├─► MySQL   (tool_logs, oauth_tokens)
        └─► Redis   (token cache, response cache)

Separate process: Express OAuth server (handles Google consent flow)
```

## Setup

```bash
git clone <repo-url>
cd gmail-mcp
npm install
cp .env.example .env
npm run oauth-server   # completes Google OAuth flow
npm start               # starts the MCP server
```

Then register the server in your MCP client config (e.g. VS Code `mcp.json`) pointing to this server's stdio entrypoint.

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI (Express OAuth server) |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection for audit logs & tokens |
| `REDIS_URL` | Redis connection string |
| `EMAIL_ENCRYPTION_KEY` | Key used for email content cryptography |

## Available Tools

| Tool | Description |
|---|---|
| `listEmails` | List recent emails, with pagination |
| `readEmail` | Read full content of a specific email |
| `searchEmail` | Search inbox by query |
| `sendEmail` | Send a new email |
| `createDraft` | Create a draft without sending |
| `getLabels` | Fetch Gmail labels |

## Screenshots

_(Add a screenshot of the tool being invoked from VS Code / Claude, plus the OAuth consent screen if relevant.)_

## Known Limitations

- No automated test coverage
- OAuth server currently runs as a separate manual step, not auto-launched with the MCP server

## License

MIT
