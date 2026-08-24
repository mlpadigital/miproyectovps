import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkOwners() {
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, subdomain, browser_title, theme_config, design_config, owner_id')
    .in('id', ['df264131-dbc2-40d8-9722-e5f5243753a2', '514dc048-0b60-4a63-b6a9-2eac82d23274']);

  for (const s of stores) {
    const { data: profile } = await supabase.from('profiles').select('id, nombre, email, status').eq('id', s.owner_id).single();
    console.log(`Store: ${s.name} (Subdomain: ${s.subdomain})`);
    console.log('Owner Profile:', profile);
    console.log('theme_config:', s.theme_config);
    console.log('design_config:', s.design_config?.sections);
    console.log('---------------------------------');
  }
}

checkOwners();
