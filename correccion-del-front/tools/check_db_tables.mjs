import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkTables() {
  const checkList = ['store_customers', 'newsletter_subscribers', 'subscribers', 'customers', 'contacts'];
  for (const t of checkList) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    console.log(`Table "${t}":`, error ? `Error: ${error.message}` : `Found (${data.length} records)`);
  }
}

checkTables();
