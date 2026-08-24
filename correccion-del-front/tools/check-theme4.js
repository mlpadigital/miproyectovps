import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('stores').select('id, theme_config, updated_at').order('updated_at', {ascending: false}).limit(5);
  for (const store of data) {
     console.log(`Store: ${store.id}, Updated: ${store.updated_at}`);
     const tc = store.theme_config;
     const keys = Object.keys(tc?.pageSections || {});
     console.log("  Page Sections keys:", keys);
     for (const key of keys) {
       const secs = tc.pageSections[key] || [];
       console.log(`  - ${key}: ${secs.map(s => s.type).join(', ')}`);
       const b = secs.find(s => s.type === 'banners');
       if (b) {
         console.log(`    Banners found! Items: ${b.settings?.items?.length}`);
       }
     }
  }
}
check();
