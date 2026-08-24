import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const storeSubdomain = url.searchParams.get('store');

    if (!storeSubdomain) {
      return new Response('Missing store parameter', { status: 400 });
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch Store and Check Profile Status
    // By using !inner on profiles, we ensure we only get a result if the join succeeds
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        subdomain,
        owner_id,
        profiles!inner(status)
      `)
      .eq('subdomain', storeSubdomain)
      .single();

    if (storeError || !storeData) {
      console.error('Store fetch error:', storeError);
      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Catálogo No Encontrado</title>
    <link>https://${storeSubdomain}.mlpadigital.com</link>
    <description>Catálogo inactivo o inexistente</description>
  </channel>
</rss>`;
      return new Response(new TextEncoder().encode(emptyXml), { 
        status: 200, 
        headers
      });
    }

    // Check if the user's account is active
    // Depending on whether profiles is returned as array or object in .single():
    const profileStatus = Array.isArray(storeData.profiles) 
        ? storeData.profiles[0]?.status 
        : storeData.profiles?.status;

    if (profileStatus !== 'active') {
      console.log(`Store ${storeSubdomain} is inactive or suspended. Returning empty XML.`);
      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Catálogo Inactivo</title>
    <link>https://${storeSubdomain}.mlpadigital.com</link>
    <description>Catálogo inactivo o suspendido</description>
  </channel>
</rss>`;
      return new Response(new TextEncoder().encode(emptyXml), { 
        status: 200,
        headers
      });
    }

    // 2. Fetch Active Products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_active', true);

    if (productsError) {
      throw productsError;
    }

    // 3. Generate XML (Google Base / Meta format)
    const storeLink = `https://${storeData.subdomain}.mlpadigital.com`;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Catálogo de ${escapeXml(storeData.name)}</title>
    <link>${storeLink}</link>
    <description>Catálogo de productos para Meta Commerce</description>
`;

    if (products && products.length > 0) {
        for (const prod of products) {
            // Usa image_url o la primera imagen del array images
            let imgUrl = prod.image_url;
            if (!imgUrl && prod.images && prod.images.length > 0) {
                imgUrl = prod.images[0];
            }
            if (!imgUrl) continue; // Meta requiere imagen obligatoria

            xml += `    <item>
      <g:id>${prod.id}</g:id>
      <g:title>${escapeXml(prod.name)}</g:title>
      <g:description>${escapeXml(prod.description || prod.name)}</g:description>
      <g:link>${storeLink}#productos</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${prod.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${prod.price} ARS</g:price>
    </item>
`;
        }
    }

    xml += `  </channel>
</rss>`;

    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return new Response(new TextEncoder().encode(xml), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Unexpected error:', error.message);
    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers
    });
  }
})

// Helper to escape special XML characters
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
}
