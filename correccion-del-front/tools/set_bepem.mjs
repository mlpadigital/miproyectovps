import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function setStoreName() {
  const storeId = 'df264131-dbc2-40d8-9722-e5f5243753a2';
  
  const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
  
  let design = store.design_config || {};
  let theme = store.theme_config || {};

  if (design.sections) {
    design.sections.logoTitle = 'B.E.P.E.M';
    design.sections.logoSubtitle = '';
  }
  theme.storeTitle = 'B.E.P.E.M';

  const { error } = await supabase.from('stores').update({
    name: 'B.E.P.E.M',
    browser_title: 'B.E.P.E.M',
    design_config: design,
    theme_config: theme
  }).eq('id', storeId);

  if (error) throw error;
  console.log('Successfully updated store df264131 to B.E.P.E.M!');
}

setStoreName();
