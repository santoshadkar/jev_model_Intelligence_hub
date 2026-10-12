const { JevCoreEngine } = require('./_lib/jev_simulator');

const jev = new JevCoreEngine();

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (res.status) return res.status(204).end();
    res.writeHead(204);
    return res.end();
  }

  const payload = {
    status: 'healthy',
    service: 'jev-model-intelligence-portal',
    environment: 'vercel-production',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    active_model: jev.modelName
  };

  if (res.status && typeof res.status === 'function') {
    return res.status(200).json(payload);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(payload));
};
