import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvwigepphqybmjscdynw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function runHealthCheck() {
  console.log('=== TEST DE SALUD DE BASE DE DATOS (SUPABASE) ===\n');

  // 1. Latencia y conectividad básica
  const t0 = Date.now();
  const { data: pingData, error: pingError } = await supabaseAnon.from('stores').select('count', { count: 'exact', head: true });
  const latency = Date.now() - t0;
  
  if (pingError) {
    console.error('❌ Error de conexión con Supabase:', pingError);
  } else {
    console.log(`✅ Conexión con Supabase exitosa (${latency}ms)`);
  }

  // 2. Conteo total de tiendas y productos (Admin vs Anon)
  const { count: totalStoresAdmin } = await supabaseAdmin.from('stores').select('*', { count: 'exact', head: true });
  const { count: totalStoresAnon, error: storesAnonErr } = await supabaseAnon.from('stores').select('*', { count: 'exact', head: true });
  console.log(`Tiendas registradas: Admin ve ${totalStoresAdmin} | Anon ve ${totalStoresAnon} (Error Anon: ${storesAnonErr ? storesAnonErr.message : 'Ninguno'})`);

  const { count: totalProdsAdmin } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });
  const { count: totalProdsAnon, error: prodsAnonErr } = await supabaseAnon.from('products').select('*', { count: 'exact', head: true });
  console.log(`Productos en BD: Admin ve ${totalProdsAdmin} | Anon ve ${totalProdsAnon} (Error Anon: ${prodsAnonErr ? prodsAnonErr.message : 'Ninguno'})`);

  // 3. Revisión tienda por tienda de permisos de lectura pública
  const { data: allStores } = await supabaseAdmin.from('stores').select('id, name, subdomain');
  console.log('\n=== REVISIÓN DE PRODUCTOS POR TIENDA (PÚBLICO / ANON) ===');
  
  for (const s of (allStores || [])) {
    const { data: adminProds } = await supabaseAdmin
      .from('products')
      .select('id, name, is_active')
      .eq('store_id', s.id);

    const { data: anonProds, error: anonErr } = await supabaseAnon
      .from('products')
      .select('*')
      .eq('store_id', s.id)
      .eq('is_active', true);

    const total = adminProds?.length || 0;
    const active = adminProds?.filter(p => p.is_active).length || 0;
    const anonVisible = anonProds?.length || 0;

    if (total > 0) {
      console.log(`\nTienda: "${s.name}" (subdominio: ${s.subdomain})`);
      console.log(`  - Total productos: ${total}`);
      console.log(`  - Activos (is_active=true): ${active}`);
      console.log(`  - Visibles para visitantes públicos (Anon): ${anonVisible}`);
      if (anonErr) {
        console.log(`  - ❌ Error de permisos RLS: ${anonErr.message}`);
      } else if (active !== anonVisible) {
        console.log(`  - ⚠️ ALERTA: Hay ${active} activos pero Anon solo ve ${anonVisible}`);
      } else {
        console.log(`  - ✅ Base de datos devuelve los ${anonVisible} productos correctamente.`);
      }
    }
  }

  // 4. Test de la query exacta que ejecuta DynamicStore.jsx
  console.log('\n=== TEST DE QUERY EXACTA DE DynamicStore.jsx ===');
  const sampleStore = allStores?.find(s => s.subdomain === 'libreria-tym') || allStores?.[0];
  if (sampleStore) {
    console.log(`Probando consulta para subdominio: "${sampleStore.subdomain}"...`);
    
    // Consulta de tienda
    const { data: storeData, error: sErr } = await supabaseAnon
      .from('stores')
      .select('*')
      .eq('subdomain', sampleStore.subdomain)
      .limit(1)
      .single();

    if (sErr) console.error('❌ Error obteniendo tienda:', sErr);
    else console.log('✅ Tienda obtenida:', storeData.name, `(ID: ${storeData.id})`);

    // Consulta de productos
    const { data: prodData, error: pErr } = await supabaseAnon
      .from('products')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_active', true);

    if (pErr) console.error('❌ Error obteniendo productos:', pErr);
    else console.log(`✅ Consulta de productos exitosa: ${prodData.length} productos obtenidos.`);
  }
}

runHealthCheck();
