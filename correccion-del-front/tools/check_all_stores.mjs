import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function check() {
  const { data: stores } = await supabaseAdmin.from('stores').select('id, name, subdomain, theme_id, theme_config, design_config');
  for (const s of (stores || [])) {
    console.log(`\nStore: ${s.name} (${s.subdomain})`);
    console.log('theme_id:', s.theme_id);
    console.log('design_config:', JSON.stringify(s.design_config));
    console.log('theme_config:', JSON.stringify(s.theme_config));
  }
}
check();
