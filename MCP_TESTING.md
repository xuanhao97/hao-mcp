# MCP Server Testing & Cursor Configuration Guide

This guide explains how to test the MCP server locally and configure it to work with Cursor.

## Prerequisites

1. Build the project:
   ```bash
   npm run build
   ```

2. Set up environment variables in a `.env` file or export them:
   ```bash
   export AROBID_BACKEND_URL="https://api.arobid.com"
   export AROBID_API_KEY="your-api-key-here"  # Optional
   ```

## Local Testing

### Method 1: Using the Test Script

We've included a test script that sends JSON-RPC requests to the MCP server:

```bash
# Make sure the project is built first
npm run build

# Run the test script
node test-mcp.js
```

The test script will:
1. Start the MCP server
2. Send a `tools/list` request to list available tools
3. Send a `tools/call` request to test the `createPersonalAccount` tool
4. Display all responses

### Method 2: Manual Testing with echo

You can manually test the server by sending JSON-RPC messages:

```bash
# Start the server
npm start

# In another terminal, send a request (example)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

### Method 3: Using MCP Inspector (Recommended)

The MCP SDK provides an inspector tool for better testing:

```bash
# Install MCP inspector globally (if not already installed)
npm install -g @modelcontextprotocol/inspector

# Run inspector with your server
npx @modelcontextprotocol/inspector node dist/index.js
```

This will open a web interface where you can:
- View available tools
- Test tool calls with a UI
- See request/response logs
- Debug issues interactively

## Configuring Cursor

Cursor supports MCP servers through its configuration. Here's how to set it up:

### Step 1: Locate Cursor Configuration

Cursor stores its configuration in different locations depending on your OS:

- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Alternatively, you can access it through Cursor:
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Look for MCP server configuration

### Step 2: Add Arobid MCP Server Configuration

Add the following configuration to Cursor's MCP settings:

```json
{
  "mcpServers": {
    "arobid": {
      "command": "node",
      "args": [
        "/absolute/path/to/arobid-mcp/dist/index.js"
      ],
      "env": {
        "AROBID_BACKEND_URL": "https://api.arobid.com",
        "AROBID_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/arobid-mcp` with the actual absolute path to your project.

### Step 3: Get the Absolute Path

On macOS/Linux:
```bash
# Get the absolute path to your project
pwd
# Output: /path/to/arobid-mcp
```

On Windows:
```powershell
# Get the absolute path
(Get-Location).Path
```

### Step 4: Update Configuration

1. Open the Cursor MCP settings file (see Step 1)
2. Add or update the `arobid` server configuration
3. Save the file
4. Restart Cursor

### Step 5: Verify Configuration

After restarting Cursor:

1. Open a chat with Cursor's AI assistant
2. Try asking: "What MCP tools are available?"
3. Or try: "Create a personal account with email test@example.com, password test123, and full name Test User"

If configured correctly, Cursor should be able to:
- List available tools from your MCP server
- Call the `createPersonalAccount` tool
- Use the tool results in its responses

## Troubleshooting

### Server Not Starting

**Issue**: MCP server fails to start

**Solutions**:
1. Check that the project is built: `npm run build`
2. Verify Node.js version: `node --version` (should be 18+)
3. Check environment variables are set correctly
4. Look at server stderr output for error messages

### Cursor Can't Find the Server

**Issue**: Cursor shows errors about not finding the MCP server

**Solutions**:
1. Verify the absolute path in the configuration is correct
2. Ensure the `dist/index.js` file exists
3. Check file permissions (should be executable)
4. Try using the full path to `node`: `/usr/local/bin/node` or `/opt/homebrew/bin/node` on macOS

### Environment Variables Not Working

**Issue**: Server can't connect to backend (missing env vars)

**Solutions**:
1. Make sure environment variables are set in the Cursor MCP config
2. Verify the variable names match exactly: `AROBID_BACKEND_URL`, `AROBID_API_KEY`
3. Restart Cursor after changing environment variables

### Testing the Connection

You can verify the MCP server works independently before configuring Cursor:

```bash
# Test that the server starts and responds
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

You should see a JSON response with the list of tools.

## Development Workflow

For active development:

1. **Terminal 1**: Watch and rebuild TypeScript
   ```bash
   npm run dev
   ```

2. **Terminal 2**: Test changes
   ```bash
   node test-mcp.js
   ```

3. **After changes**: Restart Cursor to reload the MCP server

## Example Cursor Usage

Once configured, you can use the MCP tools in Cursor conversations:

```
User: Can you create a personal account for john.doe@example.com?

Cursor: I'll create a personal account for john.doe@example.com using the createPersonalAccount tool.

[Tool call happens automatically]

Cursor: I've successfully created the account! Here are the details:
- Email: john.doe@example.com
- Full Name: John Doe
- Account ID: user-12345
- Created: 2024-01-15T10:30:00Z
```

## Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://docs.cursor.com)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)

