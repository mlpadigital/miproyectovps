import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testActivate() {
  const userId = 'ad1b6302-581a-4370-89d6-ec6d41175114';
  
  const { data: before } = await supabase.from('profiles').select('id, nombre, status').eq('id', userId).single();
  console.log('Before update:', before);

  const { error: pErr } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
  console.log('Update profile error:', pErr);

  const { data: after } = await supabase.from('profiles').select('id, nombre, status').eq('id', userId).single();
  console.log('After update:', after);
}

testActivate();
