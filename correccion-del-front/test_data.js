import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

async function checkData() {
  console.log("Testing AccessControl Query:");
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      stores (
        id,
        name,
        subdomain,
        created_at
      ),
      membership_plans (
        id,
        name,
        price_usd
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("ERROR in AccessControl query:", error.message);
  } else {
    console.log("SUCCESS! Returned profiles:", data?.length);
    if(data?.length > 0) {
      console.log("Sample stores attached:", data[0].stores);
    }
  }

  console.log("\nTesting ViewPayments Query:");
  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select(`
      id, 
      total, 
      created_at, 
      status,
      stores (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (oError) {
    console.error("ERROR in ViewPayments query:", oError.message);
  } else {
    console.log("SUCCESS! Returned orders:", orders?.length);
  }
}

checkData();
