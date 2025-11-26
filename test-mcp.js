#!/usr/bin/env node

/**
 * Simple MCP server test script
 * Tests the MCP server by sending JSON-RPC requests via stdio
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the compiled MCP server
const serverPath = join(__dirname, 'dist', 'index.js');

console.log('Starting MCP server test...\n');
console.log('Server path:', serverPath);

// Spawn the MCP server
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    // Ensure environment variables are passed
    AROBID_BACKEND_URL: process.env.AROBID_BACKEND_URL || 'https://api.arobid.com',
    AROBID_API_KEY: process.env.AROBID_API_KEY || '',
  },
});

// Track request ID
let requestId = 1;

// Helper to send JSON-RPC request
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method,
    params,
  };

  const message = JSON.stringify(request) + '\n';
  console.log('→ Sending:', JSON.stringify(request, null, 2));
  server.stdin.write(message);
}

// Handle server output
let buffer = '';
server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('← Received:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('← Raw output:', line);
      }
    }
  }
});

// Handle server errors (stderr)
server.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`\nServer exited with code ${code}`);
  process.exit(code);
});

// Test sequence
setTimeout(() => {
  console.log('\n=== Test 1: List Tools ===\n');
  sendRequest('tools/list');
}, 500);

setTimeout(() => {
  console.log('\n=== Test 2: Call createPersonalAccount Tool ===\n');
  sendRequest('tools/call', {
    name: 'createPersonalAccount',
    arguments: {
      email: 'test@example.com',
      password: 'testpassword123',
      fullName: 'Test User',
    },
  });
}, 2000);

// Close after tests
setTimeout(() => {
  console.log('\n=== Tests Complete ===\n');
  server.stdin.end();
  setTimeout(() => {
    server.kill();
    process.exit(0);
  }, 1000);
}, 5000);

