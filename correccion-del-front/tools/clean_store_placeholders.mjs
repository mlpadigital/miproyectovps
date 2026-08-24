import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanPlaceholders() {
  const { data: stores, error } = await supabase.from('stores').select('id, name, design_config, theme_config');
  if (error) throw error;

  for (const s of (stores || [])) {
    let changed = false;
    let design = s.design_config || {};
    let theme = s.theme_config || {};

    if (design.sections) {
      if (design.sections.logoTitle && design.sections.logoTitle.toLowerCase() === 'mi tienda') {
        design.sections.logoTitle = s.name;
        changed = true;
      }
      if (design.sections.logoSubtitle && design.sections.logoSubtitle.toLowerCase() === 'la mejor') {
        design.sections.logoSubtitle = '';
        changed = true;
      }
    }

    if (theme.sections) {
      if (theme.sections.logoTitle && theme.sections.logoTitle.toLowerCase() === 'mi tienda') {
        theme.sections.logoTitle = s.name;
        changed = true;
      }
      if (theme.sections.logoSubtitle && theme.sections.logoSubtitle.toLowerCase() === 'la mejor') {
        theme.sections.logoSubtitle = '';
        changed = true;
      }
    }

    if (changed) {
      console.log(`Updating store ${s.name} (${s.id})...`);
      await supabase.from('stores').update({
        design_config: design,
        theme_config: theme
      }).eq('id', s.id);
    }
  }
  console.log('Finished placeholder cleanup.');
}

cleanPlaceholders();
