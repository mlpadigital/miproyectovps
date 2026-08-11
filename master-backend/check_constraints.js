import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_constraints') || await supabase.from('pg_constraint').select('*').limit(1);
  if (error) console.log('Error:', error.message);
  
  // Let's just try to insert a dummy record and see if it fails with unique constraint
  const { data: cart } = await supabase.from('cart_config').select('id').limit(1);
  if (cart && cart.length > 0) {
    const cid = cart[0].id;
    const res = await supabase.from('payment_methods').upsert({ cart_config_id: cid, provider: 'test_provider' }, { onConflict: 'cart_config_id, provider' });
    console.log('Upsert payment result:', res);
    
    const res2 = await supabase.from('shipping_zones').upsert({ cart_config_id: cid, name: 'test_zone', cost: 10 }, { onConflict: 'cart_config_id, name' });
    console.log('Upsert shipping result:', res2);
  }
}
run();
