import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkSchema() {
  console.log('--- TABLES CHECK ---');
  const tables = [
    'profiles', 'stores', 'products', 'membership_plans', 'subscriptions',
    'support_settings', 'testimonials', 'app_settings', 'system_settings', 'admin_settings'
  ];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table '${t}': Error ${error.code} - ${error.message}`);
    } else {
      console.log(`Table '${t}': EXISTS (rows: ${data.length})`);
      if (data.length > 0) {
        console.log(`  Sample row keys:`, Object.keys(data[0]));
      }
    }
  }

  // Check profiles columns
  const { data: prof } = await supabase.from('profiles').select('*').limit(1);
  if (prof && prof.length > 0) {
    console.log('\nProfiles columns:', Object.keys(prof[0]));
  }
}

checkSchema();
