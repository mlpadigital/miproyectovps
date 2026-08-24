import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function check() {
  console.log("=== STORES ===");
  const { data: stores, error: sErr } = await supabaseAdmin.from('stores').select('*').limit(5);
  if (sErr) {
    console.error("Error stores:", sErr);
    return;
  }
  
  if (stores && stores.length > 0) {
    console.log("Store columns:", Object.keys(stores[0]));
  }
  
  for (const store of (stores || [])) {
    console.log(`\n-----------------------------------------`);
    console.log(`Store: ${store.name} (subdomain: "${store.subdomain}", id: ${store.id})`);
    console.log('theme_id:', store.theme_id);
    console.log('theme_config:', JSON.stringify(store.theme_config, null, 2));
    
    // Check products with admin
    const { data: prodsAdmin, error: pAdminErr } = await supabaseAdmin.from('products').select('id, name, is_active, price, store_id').eq('store_id', store.id);
    console.log(`Admin products count: ${prodsAdmin?.length} (active: ${prodsAdmin?.filter(p => p.is_active)?.length})`);
    
    // Check products with anon (what public visitors see)
    const { data: prodsAnon, error: pAnonErr } = await supabaseAnon.from('products').select('*').eq('store_id', store.id).eq('is_active', true);
    if (pAnonErr) {
      console.error('Anon products error:', pAnonErr);
    } else {
      console.log(`Anon products count (is_active=true): ${prodsAnon?.length}`);
      if (prodsAnon && prodsAnon.length > 0) {
        console.log('Sample anon product:', prodsAnon[0]);
      }
    }
  }
}

check();
