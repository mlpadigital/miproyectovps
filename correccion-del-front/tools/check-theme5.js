import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('stores').select('id, theme_config');
  for (const store of data) {
     const tc = store.theme_config;
     const keys = Object.keys(tc?.pageSections || {});
     for (const key of keys) {
       const secs = tc.pageSections[key] || [];
       const b = secs.find(s => s.type === 'banners');
       if (b && b.settings?.items?.[0]?.image?.length > 1000) {
         console.log(`Store: ${store.id}`);
         console.log(`  Banners found in ${key}! Image length: ${b.settings?.items?.[0]?.image?.length}`);
         console.log(`  Image starts with: ${b.settings?.items?.[0]?.image?.substring(0, 50)}`);
       }
     }
  }
}
check();
