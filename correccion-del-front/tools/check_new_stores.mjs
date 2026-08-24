import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspectStores() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, theme_id, template_id, theme_config, design_config, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  console.log('=== LATEST STORES ===');
  for (const s of (stores || [])) {
    console.log(`\n--- ID: ${s.id} | Name: "${s.name}" | Subdomain: "${s.subdomain}" ---`);
    console.log('Created at:', s.created_at);
    console.log('design_config:', JSON.stringify(s.design_config, null, 2));
    console.log('theme_config:', JSON.stringify(s.theme_config, null, 2));
  }
}

inspectStores();
