async function fetchStatus(){
  try{
    const res = await fetch('/status');
    if(!res.ok) throw new Error('no ok');
    const j = await res.json();
    document.getElementById('nginx').textContent = j.nginx + '\nactive: ' + j.nginx_active;
    document.getElementById('ufw').textContent = j.ufw;
    document.getElementById('node').textContent = (j.node || 'n/a') + ' / ' + (j.npm || 'n/a');
    document.getElementById('status').textContent = 'Última comprobación: ' + j.time;
    document.getElementById('time').textContent = new Date(j.time).toLocaleString();
  }catch(e){
    document.getElementById('nginx').textContent = 'Error al obtener estado';
    document.getElementById('ufw').textContent = '';
    document.getElementById('node').textContent = '';
    document.getElementById('status').textContent = 'Offline';
  }
}

document.getElementById('refresh').addEventListener('click', ()=>{fetchStatus(); fetchServiceStatus();});
window.addEventListener('load', ()=>{fetchStatus(); fetchServiceStatus(); setInterval(fetchStatus, 15000); setInterval(fetchServiceStatus, 20000)});

async function fetchServiceStatus(){
  try{
    const res = await fetch('/api/service-status');
    const j = await res.json();
    if(j.ok){
      document.getElementById('svc-status').textContent = Object.keys(j.services).map(k=>`--- ${k} ---\n${j.services[k].slice(0,1000)}`).join('\n\n');
    } else {
      document.getElementById('svc-status').textContent = 'Error al obtener estado de servicios';
    }
  }catch(e){
    document.getElementById('svc-status').textContent = 'Error de conexión';
  }
}

document.querySelectorAll('.action').forEach(btn=>{
  btn.addEventListener('click', async (ev)=>{
    const svc = btn.getAttribute('data-service');
    if(!confirm(`¿Reiniciar ${svc}?`)) return;
    btn.disabled = true;
    btn.textContent = 'Ejecutando...';
    try{
      const r = await fetch('/api/restart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:svc})});
      const j = await r.json();
      document.getElementById('admin-output').textContent = JSON.stringify(j, null, 2);
    }catch(e){
      document.getElementById('admin-output').textContent = String(e);
    }
    btn.disabled = false;
    btn.textContent = btn.getAttribute('data-service') === 'nginx' ? 'Reiniciar Nginx' : 'Reiniciar Panel';
    fetchServiceStatus();
  });
});

document.getElementById('regen-pass').addEventListener('click', ()=>{
  alert('La regeneración de la contraseña necesita intervención en el servidor (yo puedo hacerlo). ¿Deseas que la regenere ahora?');
});

document.getElementById('backup-now').addEventListener('click', async ()=>{
  if(!confirm('Ejecutar backup ahora? Esto puede tardar varios minutos.')) return;
  const btn = document.getElementById('backup-now');
  btn.disabled = true; btn.textContent = 'Ejecutando...';
  try{
    const r = await fetch('/api/backup',{method:'POST'});
    const j = await r.json();
    document.getElementById('admin-output').textContent = JSON.stringify(j, null, 2);
  }catch(e){
    document.getElementById('admin-output').textContent = String(e);
  }
  btn.disabled = false; btn.textContent = 'Backup ahora';
});

document.getElementById('copy-commands').addEventListener('click', ()=>{
  document.getElementById('admin-output').textContent = "Comandos permitidos (sudoers):\nsudo systemctl restart nginx\nsudo systemctl restart vps-panel\nsudo systemctl status nginx\nsudo systemctl status vps-panel";
});
