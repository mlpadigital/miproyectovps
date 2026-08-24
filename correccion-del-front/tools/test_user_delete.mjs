import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function testUserDelete() {
  // Let's get the user ID of bepem owner: 'ad1b6302-581a-4370-89d6-ec6d41175114'
  const ownerId = 'ad1b6302-581a-4370-89d6-ec6d41175114';
  const storeId = '514dc048-0b60-4a63-b6a9-2eac82d23274';

  // Insert a customer with user_id = null
  const { data: c1 } = await supabaseAdmin.from('store_customers').insert({
    store_id: storeId,
    name: 'Customer With Null UserID',
    email: 'nulluser@example.com',
    user_id: null
  }).select().single();

  // Insert a customer with user_id = ownerId
  const { data: c2 } = await supabaseAdmin.from('store_customers').insert({
    store_id: storeId,
    name: 'Customer With Owner UserID',
    email: 'owneruser@example.com',
    user_id: ownerId
  }).select().single();

  console.log('Inserted c1 (null user):', c1?.id);
  console.log('Inserted c2 (owner user):', c2?.id);
}

testUserDelete();
