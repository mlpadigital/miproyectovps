import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkOrders() {
  const { data: o1, error: e1 } = await supabaseAdmin.from('orders').select('*').limit(1);
  console.log('orders:', e1 ? e1.message : o1);
  const { data: o2, error: e2 } = await supabaseAdmin.from('store_orders').select('*').limit(1);
  console.log('store_orders:', e2 ? e2.message : o2);
}

checkOrders();
