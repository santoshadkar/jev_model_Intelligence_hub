const { JevCoreEngine } = require('../src/core/jev_simulator');

const jev = new JevCoreEngine();

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (res.status) return res.status(204).end();
    res.writeHead(204);
    return res.end();
  }

  try {
    const body = await parseBody(req);
    const scenarioId = body.scenario_id || 'p0_triage';
    const benchmark = jev.runBenchmark(scenarioId);

    if (res.status) {
      return res.status(200).json(benchmark);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(benchmark));
  } catch (err) {
    if (res.status) {
      return res.status(400).json({ error: err.message });
    }
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: err.message }));
  }
};
