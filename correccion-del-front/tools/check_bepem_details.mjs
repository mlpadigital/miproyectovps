import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function findBepem() {
  const { data: stores } = await supabaseAdmin.from('stores').select('*').ilike('name', '%bepem%');
  console.log('Stores matching bepem:', stores);
  if (stores && stores.length > 0) {
    const store = stores[0];
    const { data: customers } = await supabaseAdmin.from('store_customers').select('*').eq('store_id', store.id);
    console.log('Customers for bepem in store_customers:', customers);
    const { data: orders } = await supabaseAdmin.from('orders').select('*').eq('store_id', store.id);
    console.log('Orders for bepem:', orders.length);
  }
}

findBepem();
