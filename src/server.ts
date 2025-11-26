#!/usr/bin/env node

/**
 * Express HTTP Server for Arobid MCP
 * 
 * Provides HTTP REST API endpoints that wrap the MCP tools,
 * making them accessible via HTTP for web applications and Vercel deployment.
 */

import express, { Request, Response, NextFunction } from 'express';
import { createArobidClient } from './client/arobidClient.js';
import { createPersonalAccount } from './tools/createPersonalAccount.js';
import { verifyUser } from './tools/verifyUser.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'arobid-mcp', version: '1.0.0' });
});

// Initialize Arobid client
let arobidClient;
try {
  arobidClient = createArobidClient();
  console.log('[Arobid HTTP Server] Client initialized successfully');
} catch (error) {
  console.error('[Arobid HTTP Server] Failed to initialize client:', error);
  process.exit(1);
}

/**
 * POST /api/tools/createPersonalAccount
 * Creates a new personal user account
 */
app.post('/api/tools/createPersonalAccount', async (req: Request, res: Response) => {
  try {
    const result = await createPersonalAccount(arobidClient, req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Arobid HTTP Server] Error creating account:', errorMessage);
    
    res.status(400).json({
      success: false,
      error: {
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/tools/verifyUser
 * Verifies a user account with OTP
 */
app.post('/api/tools/verifyUser', async (req: Request, res: Response) => {
  try {
    const result = await verifyUser(arobidClient, req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Arobid HTTP Server] Error verifying user:', errorMessage);
    
    res.status(400).json({
      success: false,
      error: {
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/tools
 * List all available tools
 */
app.get('/api/tools', (_req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'createPersonalAccount',
        description: 'Creates a new personal user account in Arobid Backend',
        endpoint: '/api/tools/createPersonalAccount',
        method: 'POST',
        parameters: {
          email: { type: 'string', required: true, description: 'User email address' },
          password: { type: 'string', required: true, description: 'User password (6-20 characters with complexity requirements)' },
          firstName: { type: 'string', required: true, description: 'User first name' },
          lastName: { type: 'string', required: true, description: 'User last name' },
          title: { type: 'string', required: true, description: 'User title (Mr or Mrs)' },
          phone: { type: 'string', required: true, description: 'User phone number (Vietnamese or international format)' },
          national: { type: 'string', required: true, description: 'User nationality code (2-letter uppercase country code)' },
        },
      },
      {
        name: 'verifyUser',
        description: 'Verifies a user account in Arobid Backend using OTP code',
        endpoint: '/api/tools/verifyUser',
        method: 'POST',
        parameters: {
          userEmail: { type: 'string', required: true, description: 'User email address' },
          otp: { type: 'string', required: true, description: 'One-time password (OTP) code - exactly 6 digits' },
        },
      },
    ],
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Arobid HTTP Server] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      path: req.path,
    },
  });
});

// Start server (only if run directly, not when imported)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule || process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Arobid HTTP Server] Server running on port ${PORT}`);
    console.log(`[Arobid HTTP Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Arobid HTTP Server] API docs: http://localhost:${PORT}/api/tools`);
  });
}

export default app;

