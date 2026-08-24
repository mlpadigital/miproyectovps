import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('stores').select('theme_config').limit(1).order('updated_at', {ascending: false});
  if (data && data[0]) {
     const tc = data[0].theme_config;
     const indexSec = tc?.pageSections?.['index.html'] || [];
     const banners = indexSec.find(s => s.type === 'banners');
     if (banners) {
       console.log("Banners found.");
       const items = banners.settings?.items || [];
       console.log("Items count:", items.length);
       if (items[0]) {
          console.log("Image length:", items[0].image ? items[0].image.length : "NO IMAGE");
          console.log("Image prefix:", items[0].image ? items[0].image.substring(0, 50) : "N/A");
       }
     } else {
       console.log("No banners found in themeConfig");
     }
  }
}
check();
