import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkAll() {
  const { data: stores } = await supabaseAdmin.from('stores').select('id, name, subdomain, owner_id');
  const { data: customers } = await supabaseAdmin.from('store_customers').select('*');
  const { data: orders } = await supabaseAdmin.from('orders').select('id, store_id, customer_email, customer_name, total_amount, created_at');

  console.log('Stores:', stores);
  console.log('Customers in store_customers:', customers);
  console.log('Orders in orders table:', orders);
}

checkAll();
