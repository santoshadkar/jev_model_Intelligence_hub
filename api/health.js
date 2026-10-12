const { JevCoreEngine } = require('../src/core/jev_simulator');

const jev = new JevCoreEngine();

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const payload = {
    status: 'healthy',
    service: 'jev-model-intelligence-portal',
    environment: 'vercel-serverless-production',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    active_model: jev.modelName
  };

  if (res.status && typeof res.status === 'function') {
    return res.status(200).json(payload);
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(payload));
  }
};
