import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function testPermanentDelete() {
  // Check the two test customers we created earlier:
  // c1: 'ee5ea8b8-1cf1-42a5-942f-0abbf298658f'
  // c2: 'd607fef9-d50a-4e7e-9f48-4916cd0f12b4'

  console.log('Customers before admin delete:');
  const { data: before } = await supabaseAdmin.from('store_customers').select('id, name, email');
  console.log(before);

  // Delete c1 and c2 using supabaseAdmin
  const { error: e1 } = await supabaseAdmin.from('store_customers').delete().eq('id', 'ee5ea8b8-1cf1-42a5-942f-0abbf298658f');
  const { error: e2 } = await supabaseAdmin.from('store_customers').delete().eq('id', 'd607fef9-d50a-4e7e-9f48-4916cd0f12b4');

  console.log('Delete errors:', e1, e2);

  console.log('Customers after admin delete:');
  const { data: after } = await supabaseAdmin.from('store_customers').select('id, name, email');
  console.log(after);
}

testPermanentDelete();
