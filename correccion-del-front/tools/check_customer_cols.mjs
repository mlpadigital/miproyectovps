import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('store_customers').select('*').limit(5);
  console.log('store_customers records:', data);
  if (data && data[0]) {
    console.log('Columns:', Object.keys(data[0]));
  }
}

checkColumns();
