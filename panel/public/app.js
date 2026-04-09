// config variables
const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchStatus() {
  try {
    const res = await fetch('/status');
    if (!res.ok) throw new Error('no ok');
    const j = await res.json();
    document.getElementById('nginx').textContent = j.nginx + '\nactive: ' + j.nginx_active;
    document.getElementById('ufw').textContent = j.ufw;
    document.getElementById('node').textContent = (j.node || 'n/a') + ' / ' + (j.npm || 'n/a');
    document.getElementById('status').textContent = 'Última comprobación: ' + j.time;
    document.getElementById('time').textContent = new Date(j.time).toLocaleString();
  } catch (e) {
    document.getElementById('nginx').textContent = 'Error al obtener estado';
    document.getElementById('ufw').textContent = '';
    document.getElementById('node').textContent = '';
    document.getElementById('status').textContent = 'Offline';
  }
}

document.getElementById('refresh').addEventListener('click', () => { fetchStatus(); fetchServiceStatus(); });
window.addEventListener('load', () => { fetchStatus(); fetchServiceStatus(); setInterval(fetchStatus, 15000); setInterval(fetchServiceStatus, 20000) });

async function fetchServiceStatus() {
  try {
    const res = await fetch('/api/service-status');
    const j = await res.json();
    if (j.ok) {
      document.getElementById('svc-status').textContent = Object.keys(j.services).map(k => `--- ${k} ---\n${j.services[k].slice(0, 1000)}`).join('\n\n');
    } else {
      document.getElementById('svc-status').textContent = 'Error al obtener estado de servicios';
    }
  } catch (e) {
    document.getElementById('svc-status').textContent = 'Error de conexión';
  }
}

document.querySelectorAll('.action').forEach(btn => {
  btn.addEventListener('click', async (ev) => {
    const svc = btn.getAttribute('data-service');
    if (!confirm(`¿Reiniciar ${svc}?`)) return;
    btn.disabled = true;
    btn.textContent = 'Ejecutando...';
    try {
      const r = await fetch('/api/restart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service: svc }) });
      const j = await r.json();
      document.getElementById('admin-output').textContent = JSON.stringify(j, null, 2);
    } catch (e) {
      document.getElementById('admin-output').textContent = String(e);
    }
    btn.disabled = false;
    btn.textContent = btn.getAttribute('data-service') === 'nginx' ? 'Reiniciar Nginx' : 'Reiniciar Panel';
    fetchServiceStatus();
  });
});

document.getElementById('regen-pass').addEventListener('click', () => {
  alert('La regeneración de la contraseña necesita intervención en el servidor (yo puedo hacerlo). ¿Deseas que la regenere ahora?');
});

document.getElementById('backup-now').addEventListener('click', async () => {
  if (!confirm('Ejecutar backup ahora? Esto puede tardar varios minutos.')) return;
  const btn = document.getElementById('backup-now');
  btn.disabled = true; btn.textContent = 'Ejecutando...';
  try {
    const r = await fetch('/api/backup', { method: 'POST' });
    const j = await r.json();
    document.getElementById('admin-output').textContent = JSON.stringify(j, null, 2);
  } catch (e) {
    document.getElementById('admin-output').textContent = String(e);
  }
  btn.disabled = false; btn.textContent = 'Backup ahora';
});

async function fetchSubdomains() {
  const container = document.getElementById('subdomains-list');
  try {
    const res = await fetch('/api/subdomains');
    const j = await res.json();
    if (j.ok && j.subdomains.length > 0) {
      container.innerHTML = j.subdomains.map(s => `
        <div class="subdomain-item">
          <div class="subdomain-info">
            <strong>${s.name}</strong>
            <span>${s.domain}</span>
          </div>
          <button class="btn-delete" onclick="deleteSubdomain('${s.name}')">Eliminar</button>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="color:var(--muted)">No hay tiendas creadas.</p>';
    }
  } catch (e) {
    container.innerHTML = '<p style="color:#ff5050">Error al cargar tiendas.</p>';
  }
}

async function deleteSubdomain(name) {
  if (!confirm(`¿Estás seguro de eliminar permanentemente la tienda "${name}"? Esta acción no se puede deshacer.`)) return;
  try {
    const res = await fetch(`/api/delete-subdomain/${name}`, { method: 'DELETE' });
    const j = await res.json();
    if (j.ok) {
      alert('Tienda eliminada correctamente.');
      fetchSubdomains();
    } else {
      alert('Error: ' + j.error);
    }
  } catch (e) {
    alert('Error de conexión.');
  }
}

document.getElementById('add-subdomain-btn').addEventListener('click', async () => {
  const name = prompt('Ingresa el nombre del subdominio (solo letras, números y guiones):');
  if (!name) return;
  try {
    const res = await fetch('/api/create-client-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain: name })
    });
    const j = await res.json();
    if (j.ok) {
      alert('Tienda creada con éxito.');
      fetchSubdomains();
    } else {
      alert('Error: ' + j.error);
    }
  } catch (e) {
    alert('Error de conexión.');
  }
});

// Auth management
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showLogin();
    return false;
  }
  // Set cookie for backend middleware
  document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Strict; Secure`;
  return true;
}

function showLogin() {
  const email = prompt('Inicia sesión en el panel\nEmail:');
  if (!email) return;
  const password = prompt('Contraseña:');
  if (!password) return;
  
  supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
    if (error) {
      alert('Error de login: ' + error.message);
      showLogin();
    } else {
      location.reload();
    }
  });
}

// Update initial load
window.addEventListener('load', async () => {
  if (await checkAuth()) {
    fetchStatus();
    fetchServiceStatus();
    fetchSubdomains();
    setInterval(fetchStatus, 15000);
    setInterval(fetchServiceStatus, 20000);
    setInterval(fetchSubdomains, 30000);
  }
});

// Interceptor for 401
async function authedFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    supabase.auth.signOut();
    location.reload();
  }
  return res;
}
