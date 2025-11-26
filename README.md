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
- **Framework**: MCP SDK (`@modelcontextprotocol/sdk`)
- **Package Manager**: npm

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

### Development Mode

Watch for changes and rebuild automatically:

```bash
npm run dev
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
│   ├── client/
│   │   └── arobidClient.ts      # HTTP client for Arobid Backend
│   └── tools/
│       ├── createPersonalAccount.ts  # Create account tool
│       └── verifyUser.ts        # Verify user tool
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Available Tools

### `createPersonalAccount`

Creates a new personal user account in Arobid Backend.

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password (6-20 characters with complexity requirements)
- `firstName` (string, required): User first name
- `lastName` (string, required): User last name
- `title` (string, required): User title (Mr or Mrs)
- `phone` (string, required): User phone number (Vietnamese or international format)
- `national` (string, required): User nationality code (2-letter uppercase country code)

**Example:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Mr",
  "phone": "+841231231123",
  "national": "VN"
}
```

### `verifyUser`

Verifies a user account in Arobid Backend using the OTP code sent to the user email.

**Parameters:**
- `userEmail` (string, required): User email address
- `otp` (string, required): One-time password (OTP) code - exactly 6 digits

**Example:**
```json
{
  "userEmail": "user@example.com",
  "otp": "123456"
}
```

**Note**: The OTP in this example is for demonstration only. In production, use the actual OTP code sent to the user's email.

## MCP Server Integration

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
   # Example output: /path/to/arobid-mcp
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

