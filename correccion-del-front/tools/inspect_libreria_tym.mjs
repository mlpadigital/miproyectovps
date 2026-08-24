import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspectLibreriaTym() {
  const { data: store, error: sErr } = await supabase
    .from('stores')
    .select('*')
    .eq('subdomain', 'libreria-tym')
    .single();

  console.log('=== STORE DATA ===');
  console.log('ID:', store.id);
  console.log('Name:', store.name);
  console.log('Subdomain:', store.subdomain);
  console.log('Theme ID:', store.theme_id);
  console.log('Template ID:', store.template_id);
  console.log('Theme Config:', JSON.stringify(store.theme_config, null, 2));
  console.log('Design Config:', JSON.stringify(store.design_config, null, 2));

  const { data: prods, error: pErr } = await supabase
    .from('products')
    .select('id, name, is_active, is_featured, category, price, stock, images, image_url')
    .eq('store_id', store.id);

  console.log('\n=== PRODUCTS ===');
  console.log('Total products:', prods?.length);
  console.log('Active products (is_active=true):', prods?.filter(p => p.is_active)?.length);
  console.log('Featured products (is_featured=true):', prods?.filter(p => p.is_featured)?.length);
  console.log('Sample product:', prods?.[0]);
}

inspectLibreriaTym();
