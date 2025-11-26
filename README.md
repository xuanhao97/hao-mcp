# Arobid MCP

MCP (Model Context Protocol) server that connects to **Arobid Backend**, allowing AI tools and editors to call backend APIs in a structured way.

## Overview

Arobid MCP provides a standardized interface for interacting with Arobid Backend services through the Model Context Protocol. This enables AI assistants and development tools to seamlessly integrate with Arobid's backend capabilities.

## Features

- ✅ **Create Personal Account** - Register new user accounts via Arobid Backend
- 🔄 More tools coming soon (login, profile updates, etc.)

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Framework**: MCP SDK (`@modelcontextprotocol/sdk`) + Express.js
- **Package Manager**: npm
- **Deployment**: Vercel-compatible (serverless functions)

## Prerequisites

- Node.js 18.0.0 or higher
- npm (or pnpm if you prefer)

## Installation

1. Clone or navigate to this repository:
   ```bash
   cd arobid-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Configuration](#configuration) below)

## Configuration

Create a `.env` file in the project root with the following variables:

```env
# Required: Arobid Backend base URL
AROBID_BACKEND_URL=https://api.arobid.com

# Optional: API key for authentication (if required by backend)
AROBID_API_KEY=your-api-key-here

# Optional: Tenant ID (if multi-tenant support is needed)
AROBID_TENANT_ID=your-tenant-id
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AROBID_BACKEND_URL` | Yes | Base URL of the Arobid Backend API |
| `AROBID_API_KEY` | No | API key for authenticating requests (if required) |
| `AROBID_TENANT_ID` | No | Tenant identifier for multi-tenant setups |

## Development

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Run

Start the MCP server (stdio transport):

```bash
npm start
```

Start the HTTP server (Express.js):

```bash
npm run start:http
```

The HTTP server will run on port 3000 (or the port specified in the `PORT` environment variable).

### Development Mode

Watch for changes and rebuild automatically (MCP server):

```bash
npm run dev
```

Watch for changes and rebuild automatically (HTTP server):

```bash
npm run dev:http
```

### Type Checking

Check TypeScript types without building:

```bash
npm run type-check
```

## Project Structure

```
arobid-mcp/
├── src/
│   ├── index.ts                 # MCP server entrypoint (stdio transport)
│   ├── server.ts                # Express HTTP server entrypoint
│   ├── client/
│   │   └── arobidClient.ts      # HTTP client for Arobid Backend
│   └── tools/
│       └── createPersonalAccount.ts  # Create account tool
├── dist/                        # Compiled JavaScript (generated)
├── vercel.json                  # Vercel deployment configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Available Tools

### `createPersonalAccount`

Creates a new personal user account in Arobid Backend.

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password (minimum 6 characters)
- `fullName` (string, required): User full name
- `phone` (string, optional): User phone number
- `avatarUrl` (string, optional): URL to user avatar image

**Example:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

## Server Modes

This project supports two server modes:

### 1. MCP Server (stdio transport)

The MCP server uses stdio transport and can be integrated with any MCP-compatible client. Configure your MCP client to point to this server's entrypoint.

Example configuration (for Claude Desktop or similar):

```json
{
  "mcpServers": {
    "arobid": {
      "command": "node",
      "args": ["/path/to/arobid-mcp/dist/index.js"],
      "env": {
        "AROBID_BACKEND_URL": "https://api.arobid.com",
        "AROBID_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 2. HTTP Server (Express.js)

The HTTP server provides REST API endpoints for web applications and is optimized for Vercel deployment.

**Available Endpoints:**

- `GET /health` - Health check endpoint
- `GET /api/tools` - List all available tools
- `POST /api/tools/createPersonalAccount` - Create a personal account

**Example API Request:**

```bash
curl -X POST http://localhost:3000/api/tools/createPersonalAccount \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "fullName": "John Doe"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Vercel Deployment

This project is designed to be Vercel-compatible. The Express.js HTTP server is optimized for Vercel's serverless functions.

**To deploy:**

1. Ensure your `package.json` includes a build script
2. Set environment variables in Vercel dashboard:
   - `AROBID_BACKEND_URL`
   - `AROBID_API_KEY` (if required)
   - `AROBID_TENANT_ID` (if required)
3. Deploy using the `vercel.json` configuration

The `vercel.json` file is already configured to route all requests to the Express server at `dist/server.js`.

**Note**: 
- The HTTP server mode (`server.ts`) is recommended for Vercel deployment
- The MCP stdio server (`index.ts`) is designed for local development and MCP client integration

## Error Handling

The server includes comprehensive error handling:

- **Input Validation**: Validates required fields and data types before making API calls
- **HTTP Errors**: Converts backend HTTP errors to user-friendly messages
- **Network Errors**: Handles network failures gracefully
- **Logging**: Logs important events and errors to stderr (MCP standard)

## Testing & Cursor Integration

### Local Testing

Test the MCP server locally using the included test script:

```bash
# Build the project first
npm run build

# Run the test script
npm run test:mcp
```

The test script will:
- Start the MCP server
- Send `tools/list` request to list available tools
- Send `tools/call` request to test `createPersonalAccount`
- Display all responses

### Using MCP Inspector (Recommended)

For a better testing experience, use the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI where you can interactively test tools, view logs, and debug issues.

### Configuring Cursor

To use this MCP server with Cursor:

1. **Locate Cursor's MCP configuration file**:
   - **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - **Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - **Linux**: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. **Get your project's absolute path**:
   ```bash
   pwd
   # Example output: /Users/haopham/personal/arobid-mcp
   ```

3. **Add the configuration** (see `cursor-mcp-config.json.example` for a template):
   ```json
   {
     "mcpServers": {
       "arobid": {
         "command": "node",
         "args": ["/absolute/path/to/arobid-mcp/dist/index.js"],
         "env": {
           "AROBID_BACKEND_URL": "https://api.arobid.com",
           "AROBID_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

4. **Restart Cursor** to load the MCP server

5. **Test in Cursor**: Ask "What MCP tools are available?" or try using the tools directly.

For detailed instructions and troubleshooting, see [MCP_TESTING.md](./MCP_TESTING.md).

## TODO / Known Limitations

The following items need to be configured based on actual Arobid Backend API:

- [ ] Verify exact endpoint path for account creation (currently `/api/v1/auth/register`)
- [ ] Verify authentication header format (currently using `Authorization: Bearer <key>`)
- [ ] Verify tenant ID header name (currently using `X-Tenant-ID`)
- [ ] Add response type definitions based on actual API responses
- [ ] Add additional tools (login, profile update, etc.)

All TODO items are marked with `// TODO` comments in the code.

## Contributing

When adding new tools:

1. Create a new file in `src/tools/` (e.g., `src/tools/myNewTool.ts`)
2. Export the tool definition and handler function
3. Register the tool in `src/index.ts`
4. Update this README with tool documentation

## License

MIT

