const express = require('express');
const { exec } = require('child_process');
const client = require('prom-client');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Prometheus default metrics
client.collectDefaultMetrics({ timeout: 5000 });

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (e) {
    res.status(500).send(String(e));
  }
});

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: opts.timeout || 10000 }, (err, stdout, stderr) => {
      const out = (stdout || '') + (stderr || '');
      if (err && opts.rejectOnError) return reject(out.trim());
      resolve(out.trim());
    });
  });
}

app.get('/status', async (req, res) => {
  const [nginxVer, nginxActive, ufwStatus, nodeVer, npmVer] = await Promise.all([
    run('nginx -v').catch(() => ''),
    run('systemctl is-active nginx || true').catch(() => ''),
    run('ufw status verbose || true').catch(() => ''),
    run('node -v || true').catch(() => ''),
    run('npm -v || true').catch(() => '')
  ]);

  res.json({
    nginx: nginxVer || 'no-detect',
    nginx_active: nginxActive || 'unknown',
    ufw: ufwStatus || 'no-detect',
    node: nodeVer || process.version || 'no-detect',
    npm: npmVer || 'no-detect',
    time: new Date().toISOString()
  });
});

// Allowed services that the panel can manage
const ALLOWED_SERVICES = {
  nginx: 'nginx',
  'vps-panel': 'vps-panel'
};

app.post('/api/restart', async (req, res) => {
  const service = String(req.body.service || '').trim();
  if (!Object.keys(ALLOWED_SERVICES).includes(service)) {
    return res.status(400).json({ error: 'service-not-allowed' });
  }
  try {
    const cmd = `sudo systemctl restart ${ALLOWED_SERVICES[service]}`;
    await run(cmd, { rejectOnError: true });
    const status = await run(`sudo systemctl is-active ${ALLOWED_SERVICES[service]} || true`);
    return res.json({ ok: true, status: status });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// Trigger a restic backup via script (allowed in sudoers)
app.post('/api/backup', async (req, res) => {
  try {
    const out = await run('sudo /usr/local/bin/vps_restic_backup.sh', { timeout: 600000 });
    return res.json({ ok: true, output: out });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/service-status', async (req, res) => {
  try {
    const results = {};
    for (const k of Object.keys(ALLOWED_SERVICES)) {
      const svc = ALLOWED_SERVICES[k];
      results[k] = await run(`sudo systemctl status ${svc} --no-pager -l || true`);
    }
    return res.json({ ok: true, services: results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`VPS panel listening on http://localhost:${PORT}`);
});
