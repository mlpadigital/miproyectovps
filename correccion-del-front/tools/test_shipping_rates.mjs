import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testRates() {
  console.log('--- TEST 1: Sending 2 separate package objects (Current Bug) ---');
  const res1 = await supabase.functions.invoke('shipping-rates', {
    body: {
      originZip: '1414',
      destinationZip: '1406',
      packages: [
        { weight: 0.5, length: 10, width: 10, height: 10, amount: 1 },
        { weight: 0.5, length: 10, width: 10, height: 10, amount: 1 }
      ],
      enabledCarriers: ['correo_argentino', 'oca', 'andreani']
    }
  });
  console.log('Result 1 (2 packages):', JSON.stringify(res1.data, null, 2));

  console.log('\n--- TEST 2: Sending 1 consolidated package (Consolidated) ---');
  const res2 = await supabase.functions.invoke('shipping-rates', {
    body: {
      originZip: '1414',
      destinationZip: '1406',
      packages: [
        { weight: 1.0, length: 10, width: 10, height: 20, amount: 1 }
      ],
      enabledCarriers: ['correo_argentino', 'oca', 'andreani']
    }
  });
  console.log('Result 2 (1 consolidated package):', JSON.stringify(res2.data, null, 2));
}

testRates();
