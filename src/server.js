/**
 * Jev Intelligence Portal Microservice & Application Server
 * Implements the OpenAPI 3.1 specification (docs/api_spec.json).
 * Production Hardened: Security headers, graceful shutdown, dist/ fallback.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { JevCoreEngine } = require('./core/jev_simulator');
const { ArchitecturalDiagnosticEngine } = require('./core/decision_matrix');

// Load environment configuration from .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const jevEngine = new JevCoreEngine();
const diagnosticEngine = new ArchitecturalDiagnosticEngine();

// In production, prioritize compiled dist/ directory over public/
const DIST_DIR = path.resolve(__dirname, '../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SERVE_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR;

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=UTF-8'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Malformed JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API Routes ---
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      service: 'jev-model-intelligence-portal',
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      active_model: jevEngine.modelName,
      uptime_seconds: process.uptime()
    });
  }

  if (pathname === '/api/evaluate' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const result = jevEngine.evaluate(payload);
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (pathname === '/api/benchmark' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const scenarioId = payload.scenario_id || 'p0_triage';
      const benchmark = jevEngine.runBenchmark(scenarioId);
      return sendJson(res, 200, benchmark);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (pathname === '/api/diagnose' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const diagnosis = diagnosticEngine.diagnose(payload);
      return sendJson(res, 200, diagnosis);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Special docs serving route
  if (pathname.startsWith('/docs/')) {
    const docFile = pathname.replace('/docs/', '');
    const docPath = path.join(__dirname, '../docs', docFile);
    if (fs.existsSync(docPath) && fs.statSync(docPath).isFile()) {
      const ext = path.extname(docPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      });
      return fs.createReadStream(docPath).pipe(res);
    }
  }

  // --- Static Asset Serving ---
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(SERVE_DIR, safePath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    return fs.createReadStream(fullPath).pipe(res);
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint or asset not found' }));
});

// Graceful shutdown handling
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Commencing graceful shutdown...`);
    server.close(() => {
      console.log('✓ HTTP microservice closed. Exiting process cleanly.');
      process.exit(0);
    });

    // Force close if lingering after 5 seconds
    setTimeout(() => {
      console.error('⚠️ Forcefully terminating after timeout');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  setupGracefulShutdown();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` JEV MODEL INTELLIGENCE PORTAL [PRODUCTION READY]`);
    console.log(` Active Port:   http://localhost:${PORT}`);
    console.log(` Serving From:  ${SERVE_DIR}`);
    console.log(` OpenAPI Spec:  http://localhost:${PORT}/docs/api_spec.json`);
    console.log(` Health Probe:  http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = { server, jevEngine, diagnosticEngine };
