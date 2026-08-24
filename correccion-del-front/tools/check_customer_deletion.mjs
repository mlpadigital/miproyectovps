import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.8mI5_Z4c5xLw9W3tZ0Q0x_4aB3v_8xLw9W3tZ0Q0x_4';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspectCustomers() {
  console.log('--- Checking store_customers table ---');
  const { data: customers, error } = await supabaseAdmin
    .from('store_customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  console.log(`Found ${customers.length} customers in total:`);
  customers.forEach(c => {
    console.log(`- ID: ${c.id}, Name: ${c.name}, Email: ${c.email}, StoreID: ${c.store_id}, OrdersCount: ${c.orders_count}`);
  });
}

inspectCustomers();
