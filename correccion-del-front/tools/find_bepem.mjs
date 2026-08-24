import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function findStore() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, subdomain, theme_id, template_id, theme_config, design_config, browser_title, owner_id');

  console.log('=== ALL STORES ===');
  for (const s of (stores || [])) {
    console.log(`ID: ${s.id}`);
    console.log(`Name in DB (name): "${s.name}"`);
    console.log(`Subdomain: "${s.subdomain}"`);
    console.log(`Browser title: "${s.browser_title}"`);
    console.log(`theme_config.storeTitle: "${s.theme_config?.storeTitle}"`);
    console.log(`design_config.sections.logoTitle: "${s.design_config?.sections?.logoTitle}"`);
    console.log(`design_config.browser_title: "${s.design_config?.browser_title}"`);
    console.log('-------------------------------------------');
  }
}

findStore();
