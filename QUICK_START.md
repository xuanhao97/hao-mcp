# Quick Start: Testing & Cursor Setup

## 🚀 Quick Test (30 seconds)

```bash
# 1. Build the project
npm run build

# 2. Run the test
npm run test:mcp
```

You should see the MCP server respond with tool listings and test results.

## 🎯 Setup Cursor (2 minutes)

### Step 1: Get Your Project Path

```bash
pwd
# Copy this path - you'll need it in Step 3
```

### Step 2: Find Cursor Config File

**macOS:**
```bash
open ~/Library/Application\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/
```

**Or manually navigate to:**
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Windows: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- Linux: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Step 3: Add Configuration

Open `cline_mcp_settings.json` and add:

```json
{
  "mcpServers": {
    "arobid": {
      "command": "node",
      "args": ["/Users/haopham/personal/arobid-mcp/dist/index.js"],
      "env": {
        "AROBID_BACKEND_URL": "https://api.arobid.com",
        "AROBID_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**⚠️ Important:** Replace `/Users/haopham/personal/arobid-mcp` with your actual path from Step 1!

### Step 4: Restart Cursor

Close and reopen Cursor completely.

### Step 5: Test in Cursor

Open a chat and try:
- "What MCP tools are available?"
- "Create a personal account for test@example.com with password test123 and name Test User"

## 🐛 Troubleshooting

**Server not found?**
- Check the path is absolute (starts with `/` on Mac/Linux)
- Verify `dist/index.js` exists: `ls dist/index.js`
- Make sure you ran `npm run build`

**Environment variables not working?**
- Check the `env` section in the config
- Restart Cursor after changing env vars

**Need more help?**
See [MCP_TESTING.md](./MCP_TESTING.md) for detailed instructions.

