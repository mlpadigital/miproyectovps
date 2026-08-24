import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);

async function testStatusUpdate() {
  const userId = 'ad1b6302-581a-4370-89d6-ec6d41175114';
  console.log('Testing user status query for:', userId);
  
  const { data: userProf, error: err1 } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  console.log('User profile:', userProf, 'Error:', err1);

  const { data: userSub, error: err2 } = await supabaseAdmin.from('subscriptions').select('*').eq('client_id', userId);
  console.log('User subscriptions:', userSub, 'Error:', err2);
}

testStatusUpdate();
