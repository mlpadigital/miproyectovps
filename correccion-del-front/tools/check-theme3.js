import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('stores').select('theme_config').limit(1).order('updated_at', {ascending: false});
  if (data && data[0]) {
     const tc = data[0].theme_config;
     console.log("Page Sections keys:", Object.keys(tc?.pageSections || {}));
     for (const key of Object.keys(tc?.pageSections || {})) {
       const secs = tc.pageSections[key];
       console.log(`- ${key}: ${secs.map(s => s.type).join(', ')}`);
       const b = secs.find(s => s.type === 'banners');
       if (b) {
         console.log(`  Banners found in ${key}! Image length: ${b.settings?.items?.[0]?.image?.length}`);
         console.log(`  Image starts with: ${b.settings?.items?.[0]?.image?.substring(0, 30)}`);
       }
     }
  }
}
check();
