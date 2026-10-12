const fs = require('node:fs');
const path = require('node:path');

module.exports = (req, res) => {
  // Try finding index.html in public/, root, or dist/
  const candidatePaths = [
    path.join(__dirname, '../public/index.html'),
    path.join(__dirname, '../index.html'),
    path.join(__dirname, '../dist/index.html')
  ];

  let targetPath = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (targetPath) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return fs.createReadStream(targetPath).pipe(res);
  }

  res.statusCode = 404;
  res.end('index.html not found');
};
