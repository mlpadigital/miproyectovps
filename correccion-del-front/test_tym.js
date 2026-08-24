import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

async function checkStore() {
  const { data: store } = await supabase.from('stores').select('*').eq('subdomain', 'libreria-tym').single();
  console.log("Store found:", store?.id, store?.name);

  if (store) {
    const { data: products } = await supabase.from('products').select('*').eq('store_id', store.id);
    console.log(`Found ${products?.length} products for this store.`);
    if (products?.length > 0) {
       console.log("Sample product:", products[0].name);
    }
  }
}

checkStore();
