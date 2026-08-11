import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: pm } = await supabase.from('payment_methods').select('provider');
  const providers = new Set(pm.map(p => p.provider));
  console.log('Providers:', Array.from(providers));
}
run();
