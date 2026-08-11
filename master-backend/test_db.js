import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- DATA CHECK ---');
  const { data: stores } = await supabase.from('stores').select('id, name, subdomain');
  console.log('Stores:', stores.length);
  if (stores.length > 0) {
    const storeId = stores[0].id;
    const { data: cart } = await supabase.from('cart_config').select('*').eq('store_id', storeId);
    console.log('Cart configs for store 0:', cart);
    
    if (cart && cart.length > 0) {
      const { data: payments } = await supabase.from('payment_methods').select('*').eq('cart_config_id', cart[0].id);
      console.log('Payments:', payments);
      
      const { data: shipping } = await supabase.from('shipping_zones').select('*').eq('cart_config_id', cart[0].id);
      console.log('Shipping:', shipping);
    }
  }

  console.log('--- RLS POLICIES ---');
  const { data: policies, error } = await supabase.rpc('get_policies') || await supabase.from('pg_policies').select('*').in('tablename', ['stores', 'cart_config', 'payment_methods', 'shipping_zones']);
  if (error) {
     // fallback if pg_policies is not accessible via standard select
     console.log('Could not fetch pg_policies directly:', error.message);
  } else {
     console.log('Policies:', policies);
  }
}
run();
