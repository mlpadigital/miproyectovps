import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const storeId = '6ecd4bbe-81cd-4ded-954c-eb6faf7e16cf';
  const { data: customers } = await supabase.from('store_customers').select('*').eq('store_id', storeId);
  console.log('Customers of ninapersonalizados:', customers);
}
run();
