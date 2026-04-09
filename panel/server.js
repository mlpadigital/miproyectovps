require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const client = require('prom-client');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase Initialization
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.supabase.co"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(morgan('combined')); // Better logging
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Prometheus default metrics
client.collectDefaultMetrics({ timeout: 5000 });

// Auth Middleware
const authenticate = async (req, res, next) => {
  const token = req.cookies['sb-access-token'] || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'No se encontró token de sesión' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Sesión inválida o expirada' });
  }

  req.user = user;
  next();
};

// RBAC Middleware (simple version: check if user is in an 'admin' metadata or specific email)
const requireAdmin = (req, res, next) => {
  const isAdmin = req.user.app_metadata?.role === 'admin' || req.user.user_metadata?.is_admin === true;
  // Fallback for bootstrap: allow the first user or specific emails
  const allowedEmails = ['martin@mlpadigital.com']; // Replace with actual admin email if known
  
  if (!isAdmin && !allowedEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'forbidden', message: 'Acceso denegado: se requieren permisos de administrador' });
  }
  next();
};

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

// Public endpoints
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

// Protected endpoints
app.use('/api', authenticate);

// Allowed services that the panel can manage
const ALLOWED_SERVICES = {
  nginx: 'nginx',
  'vps-panel': 'vps-panel'
};

app.post('/api/restart', requireAdmin, async (req, res) => {
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
app.post('/api/backup', requireAdmin, async (req, res) => {
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

app.post('/api/create-client-store', async (req, res) => {
  // Webhook access might need a secret key or fixed IP check
  // For now, we keep it as is but it's under /api which requires auth
  try {
    console.log('Received webhook:', req.body);
    const { subdomain } = req.body;

    if (!subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
      return res.status(400).json({ ok: false, error: 'invalid-subdomain-format' });
    }

    const cmd = `sudo -n /usr/local/bin/create_subdomain.sh ${subdomain}`;
    const output = await run(cmd, { rejectOnError: true });

    return res.json({ ok: true, message: 'Subdomain created', output });
  } catch (e) {
    console.error('Error creating subdomain:', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/subdomains', async (req, res) => {
  try {
    const output = await run('ls -1 /etc/nginx/sites-available/*.mlpadigital.com.conf || true');
    const files = output.split('\n').filter(f => f.trim() !== '');
    const subdomains = files.map(f => {
      const name = path.basename(f, '.mlpadigital.com.conf');
      return {
        name,
        domain: `${name}.mlpadigital.com`,
        config: f
      };
    }).filter(s => s.name !== 'panel');

    return res.json({ ok: true, subdomains });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.delete('/api/delete-subdomain/:subdomain', requireAdmin, async (req, res) => {
  try {
    const { subdomain } = req.params;
    if (!subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
      return res.status(400).json({ ok: false, error: 'invalid-subdomain-format' });
    }

    const cmd = `sudo -n /usr/local/bin/delete_subdomain.sh ${subdomain}`;
    await run(cmd, { rejectOnError: true });

    return res.json({ ok: true, message: 'Subdomain deleted' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`VPS panel listening on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`VPS panel listening on http://localhost:${PORT}`);
});
