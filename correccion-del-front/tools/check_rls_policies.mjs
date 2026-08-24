import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.8mI5_Z4c5xLw9W3tZ0Q0x_4aB3v_8xLw9W3tZ0Q0x_4';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkPolicies() {
  console.log('Testing delete via service key vs anon...');
  
  // Let's create a dummy customer first
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('store_customers')
    .insert({
      store_id: '514dc048-0b60-4a63-b6a9-2eac82d23274',
      name: 'Test Delete',
      email: 'testdelete@example.com',
      status: 'subscriber'
    })
    .select()
    .single();

  console.log('Inserted test customer:', inserted, insErr);

  if (inserted) {
    // Try to delete using ANON client without auth
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    
    const { data: delData, error: delErr } = await anonClient
      .from('store_customers')
      .delete()
      .eq('id', inserted.id)
      .select();

    console.log('Anon delete result:', delData, delErr);
    
    // Check if still in DB
    const { data: check } = await supabaseAdmin.from('store_customers').select('*').eq('id', inserted.id);
    console.log('Is test customer still in DB?', check);

    // Clean up
    await supabaseAdmin.from('store_customers').delete().eq('id', inserted.id);
  }
}

checkPolicies();
