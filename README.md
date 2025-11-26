# Arobid MCP

MCP (Model Context Protocol) server that connects to **Arobid Backend**, allowing AI tools and editors to call backend APIs in a structured way.

## Overview

Arobid MCP provides a standardized interface for interacting with Arobid Backend services through the Model Context Protocol. This enables AI assistants and development tools to seamlessly integrate with Arobid's backend capabilities.

The server currently provides **6 comprehensive tools** covering account management, authentication, and password reset workflows. All tools include robust input validation, error handling, and detailed logging.

## Features

### Account Management
- ✅ **Create Personal Account** - Register new user accounts via Arobid Backend
- ✅ **Verify User** - Verify user account using OTP code sent to email

### Authentication
- ✅ **User Login** - Login to retrieve a new OTP when the previous one has expired
- ✅ **Resend OTP** - Resend OTP code to user email when verification fails or OTP expires

### Password Reset & Change Password
- ✅ **Check Reset Password** - Initiate password reset (forgot password) or change password (update existing) process by sending reset link/OTP to user email. Supports both scenarios with the same workflow.
- ✅ **Confirm Reset Password** - Confirm password reset/change using OTP sent to email after checkResetPassword

### Coming Soon
- 🔄 Profile management tools
- 🔄 Additional user management features

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

| Variable             | Required | Description                                       |
| -------------------- | -------- | ------------------------------------------------- |
| `AROBID_BACKEND_URL` | Yes      | Base URL of the Arobid Backend API                |
| `AROBID_API_KEY`     | No       | API key for authenticating requests (if required) |
| `AROBID_TENANT_ID`   | No       | Tenant identifier for multi-tenant setups         |

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

### Code Formatting

Format code using Prettier:

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

## Project Structure

```
arobid-mcp/
├── src/
│   ├── index.ts                 # MCP server entrypoint (stdio transport)
│   ├── client/
│   │   └── arobidClient.ts      # HTTP client for Arobid Backend
│   ├── utils/
│   │   └── validation.ts        # Shared validation utilities (email regex, etc.)
│   ├── server/
│   │   ├── registerTools.ts     # Tool registration orchestrator
│   │   └── tools/
│   │       ├── registerCreatePersonalAccount.ts
│   │       ├── registerUserLogin.ts
│   │       ├── registerVerifyUser.ts
│   │       ├── registerResendOtp.ts
│   │       ├── registerCheckResetPassword.ts
│   │       └── registerConfirmResetPassword.ts
│   └── tools/
│       ├── createPersonalAccount.ts  # Create account tool
│       ├── userLogin.ts         # User login tool
│       ├── verifyUser.ts        # Verify user tool
│       ├── resendOtp.ts         # Resend OTP tool
│       ├── checkResetPassword.ts # Check/reset password tool
│       └── confirmResetPassword.ts # Confirm reset password tool
├── api/
│   └── server.ts                # Vercel API route handler (HTTP transport)
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Available Tools

### Workflows

#### Account Creation & Verification Workflow
1. Use `createPersonalAccount` to register a new account
2. Check email for OTP code
3. Use `verifyUser` with the OTP to complete account verification
4. If OTP expires, use `resendOtp` or `userLogin` to get a new one

#### Password Reset & Change Password Workflow
**Use Case 1: Password Reset (Forgot Password)**
1. Use `checkResetPassword` with user email to initiate password reset
2. Check email for OTP code
3. Use `confirmResetPassword` with email, new password, and OTP to complete the reset

**Use Case 2: Change Password (Update Existing Password)**
1. Use `checkResetPassword` with user email to initiate password change
2. Check email for OTP code
3. Use `confirmResetPassword` with email, new password, and OTP to complete the change

Both scenarios follow the same workflow - the tool automatically handles both reset and change password requests.

#### OTP Recovery Workflow
- If OTP expires during verification: Use `resendOtp` to get a new OTP
- Alternative: Use `userLogin` to login and receive a new OTP

---

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

### `userLogin`

Performs user login in Arobid Backend. This can be used to retrieve a new OTP when the previous one has expired.

**Parameters:**

- `email` (string, required): User email address
- `password` (string, required): User password

**Example:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Note**: After successful login, a new OTP will be sent to the user's email. Use this tool when you need to retrieve a fresh OTP after the previous one has expired.

### `resendOtp`

Resends OTP code to user email in Arobid Backend. Use this when verifyUser fails due to expired or invalid OTP.

**Parameters:**

- `userEmail` (string, required): User email address

**Example:**

```json
{
  "userEmail": "user@example.com"
}
```

**Note**: After calling this tool, a new OTP will be sent to the user's email. Use this tool when verification fails or the OTP has expired, instead of using `userLogin`.

### `checkResetPassword`

Initiates password reset or change password process in Arobid Backend. This will send a reset link or OTP to the user's email.

**Use Cases:**
- **Password Reset**: When a user has forgotten their password and needs to reset it
- **Change Password**: When a user wants to change their existing password for security reasons

**Parameters:**

- `email` (string, required): User email address

**Example:**

```json
{
  "email": "user@example.com"
}
```

**Note**: After calling this tool, a password reset link or OTP will be sent to the user's email. Use this tool for both scenarios: (1) when a user needs to reset their forgotten password, or (2) when a user wants to change their existing password. The tool automatically handles both cases. After receiving the OTP, use `confirmResetPassword` to complete the process.

### `confirmResetPassword`

Confirms password reset in Arobid Backend using the OTP sent to user email. Use this after `checkResetPassword` succeeds.

**Parameters:**

- `email` (string, required): User email address
- `password` (string, required): New password (6-20 characters with complexity requirements)
- `otp` (string, required): One-time password (OTP) code - exactly 6 digits

**Example:**

```json
{
  "email": "user@example.com",
  "password": "NewSecurePass123!",
  "otp": "123456"
}
```

**Note**: Use this tool after `checkResetPassword` succeeds. The OTP code will be sent to the user's email when `checkResetPassword` is called. The password must meet complexity requirements (lowercase, uppercase, numbers, and special characters).

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

**Note**: The OTP in this example is for demonstration only. In production, use the actual OTP code sent to the user's email. If the OTP has expired or verification fails, use `resendOtp` to get a new OTP code, or use `userLogin` to retrieve a new one via login.

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
        "AROBID_BACKEND_URL": https://api.example.com",
        "AROBID_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Error Handling

The server includes comprehensive error handling:

- **Input Validation**: Validates required fields and data types before making API calls
  - Shared validation utilities for consistent email validation across all tools
  - Password complexity requirements enforced
  - OTP format validation (6 digits)
- **HTTP Errors**: Converts backend HTTP errors to user-friendly messages
- **Network Errors**: Handles network failures gracefully
- **Logging**: Logs important events and errors to stderr (MCP standard)
  - Sensitive data (passwords, OTPs) are automatically redacted in logs

## Code Quality

The codebase follows best practices:

- **DRY Principle**: Shared validation utilities prevent code duplication
- **Type Safety**: Full TypeScript support with proper type definitions
- **Consistent Patterns**: All tools follow the same structure and error handling patterns
- **Modular Architecture**: Clear separation between tools, registration, and utilities

## Testing & Cursor Integration

### Local Testing

Test the MCP server locally using the MCP Inspector (recommended):

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
           "AROBID_BACKEND_URL": https://api.example.com",
           "AROBID_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

4. **Restart Cursor** to load the MCP server

5. **Test in Cursor**: Ask "What MCP tools are available?" or try using the tools directly.

For detailed instructions and troubleshooting, see [MCP_TESTING.md](./MCP_TESTING.md).

## Deploying to Vercel

This MCP server can be deployed to Vercel as a serverless function, allowing it to be accessed via HTTP instead of stdio.

### Prerequisites

- A Vercel account
- Vercel CLI installed (optional, for local testing)

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Set up environment variables in Vercel**:

   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add the following variables:
     - `AROBID_BACKEND_URL` (required)
     - `AROBID_API_KEY` (optional)
     - `AROBID_TENANT_ID` (optional)

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

4. **Get your MCP server URL**:

   After deployment, you'll get a URL like `https://your-project.vercel.app`. The MCP endpoint will be available at:
   ```
   https://your-project.vercel.app/api/mcp
   ```

### Configuring MCP Clients for Vercel Deployment

#### For Cursor

Update your `.cursor/mcp.json` configuration to use the HTTP transport:

```json
{
  "mcpServers": {
    "arobid": {
      "url": "https://your-project.vercel.app/mcp",
      "headers":{
       "X-Arobid-Backend-Url": https://api.example.com"
      }
    }
  }
}
```

#### For Other MCP Clients

Use the Streamable HTTP transport format with your Vercel deployment URL:

```
https://your-project.vercel.app/api/mcp
```

### Testing the Vercel Deployment

You can test your deployed MCP server using the MCP Inspector:

```bash
pnpm dlx @modelcontextprotocol/inspector@latest http://your-project.vercel.app/api/mcp undefined
```

Then:
1. Open `http://127.0.0.1:6274` in your browser
2. Select "Streamable HTTP" in the dropdown
3. Enter your Vercel URL: `https://your-project.vercel.app/api/mcp`
4. Click "Connect"

### Local Development with Vercel

To test the Vercel integration locally:

```bash
vercel dev
```

This will start a local server that mimics Vercel's serverless environment.

## TODO / Known Limitations

The following items need to be configured based on actual Arobid Backend API:

- [x] Email validation regex refactored to shared utilities
- [ ] Verify exact endpoint paths match production API
- [ ] Verify authentication header format (currently using `Authorization: Bearer <key>`)
- [ ] Verify tenant ID header name (currently using `X-Tenant-ID`)
- [ ] Add response type definitions based on actual API responses
- [ ] Add additional tools (profile update, etc.)

All TODO items are marked with `// TODO` comments in the code.

## Contributing

When adding new tools:

1. Create a new file in `src/tools/` (e.g., `src/tools/myNewTool.ts`)
2. Create a registration file in `src/server/tools/` (e.g., `src/server/tools/registerMyNewTool.ts`)
3. Register the tool in `src/server/registerTools.ts`
4. Use shared validation utilities from `src/utils/validation.ts` for email validation and other common checks
5. Update this README with tool documentation

## License

MIT
