import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
import { execSync } from 'child_process';

async function run() {
  console.log('Checking for duplicates in payment_methods');
  const { data: pm } = await supabase.from('payment_methods').select('cart_config_id, provider');
  console.log('payment_methods count:', pm?.length);
  
  console.log('Checking for duplicates in shipping_zones');
  const { data: sz } = await supabase.from('shipping_zones').select('cart_config_id, name');
  console.log('shipping_zones count:', sz?.length);
}
run();
