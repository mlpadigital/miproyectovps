import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function testUpdate() {
  // Let's create a dummy customer
  const { data: inserted } = await supabaseAdmin
    .from('store_customers')
    .insert({
      store_id: '514dc048-0b60-4a63-b6a9-2eac82d23274',
      name: 'Test Update',
      email: 'testupdate@example.com',
      status: 'active'
    })
    .select()
    .single();

  console.log('Inserted customer:', inserted?.id);

  // Test updating status via anon
  const { data: updatedAnon, error: upErr } = await anonClient
    .from('store_customers')
    .update({ status: 'deleted' })
    .eq('id', inserted.id)
    .select();

  console.log('Anon update result:', updatedAnon, upErr);

  // Clean up
  await supabaseAdmin.from('store_customers').delete().eq('id', inserted.id);
}

testUpdate();
