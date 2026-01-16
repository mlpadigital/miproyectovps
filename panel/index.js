const http = require('http')
const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

const PORT = process.env.PORT || 3000
const STATIC_DIR = path.join(__dirname, 'public')

function sendFile(res, file) {
  const p = path.join(STATIC_DIR, file)
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    res.writeHead(200, {'Content-Type': file.endsWith('.html') ? 'text/html' : 'text/plain'})
    res.end(data)
  })
}

function runSystemctl(action, service, cb) {
  // action: start|stop|restart|status
  const cmd = `sudo /bin/systemctl ${action} ${service}`
  exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
    cb(err, stdout || stderr)
  })
}

function getStatus(cb) {
  // Return simple statuses
  exec('systemctl is-active nginx || true', (e1, o1) => {
    exec('ufw status verbose || true', (e2, o2) => {
      exec('node -v || true', (e3, o3) => {
        cb({ nginx: (o1||'').trim(), ufw: (o2||'').split('\n')[0]||'', node: (o3||'').trim() })
      })
    })
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) return sendFile(res, 'index.html')
  if (req.method === 'GET' && req.url === '/status') {
    return getStatus((s)=>{
      res.setHeader('Content-Type','application/json')
      res.end(JSON.stringify(s))
    })
  }
  if (req.method === 'POST' && req.url === '/action') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const obj = JSON.parse(body)
        const { service, action } = obj
        if (!service || !action) throw new Error('invalid')
        if (!['start','stop','restart','status'].includes(action)) throw new Error('invalid-action')
        runSystemctl(action, service, (err, out) => {
          res.setHeader('Content-Type','application/json')
          res.end(JSON.stringify({ ok: !err, output: out.toString().slice(0,2000), error: err ? err.message : null }))
        })
      } catch (err) {
        res.writeHead(400)
        res.end('bad request')
      }
    })
    return
  }
  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, '127.0.0.1', ()=>{
  console.log(`VPS panel escuchando en http://127.0.0.1:${PORT}`)
})
