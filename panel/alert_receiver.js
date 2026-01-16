const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const LOG = '/var/log/vps-alerts.log';

function logLine(line){
  const ts = new Date().toISOString();
  const entry = `[${ts}] ${line}\n`;
  try{ fs.appendFileSync(LOG, entry); }catch(e){
    console.error('Failed to write alert log', e);
  }
}

app.post('/alert', (req, res) => {
  const body = req.body || {};
  logLine(JSON.stringify(body));
  res.status(200).send('ok');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Alert receiver listening on ${PORT}`));
