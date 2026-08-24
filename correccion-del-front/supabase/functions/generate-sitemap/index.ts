import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Obtener todas las tiendas
    const { data: stores, error: storesError } = await supabaseClient
      .from('stores')
      .select('id, subdomain, updated_at')
      .not('subdomain', 'is', null);

    if (storesError) throw storesError;

    // 2. Obtener todos los productos
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, store_id, updated_at')
      .eq('is_active', true);

    if (productsError) throw productsError;

    // Armar el XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Agregar la URL principal y el directorio
    xml += `  <url>\n    <loc>https://mlpadigital.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://mlpadigital.com/tiendas</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Agregar cada tienda
    const storeMap = new Map();
    for (const store of stores || []) {
      if (!store.subdomain) continue;
      
      const baseUrl = `https://${store.subdomain}.mlpadigital.com`;
      storeMap.set(store.id, baseUrl);

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      if (store.updated_at) {
        xml += `    <lastmod>${new Date(store.updated_at).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Agregar cada producto
    for (const product of products || []) {
      const storeBaseUrl = storeMap.get(product.store_id);
      if (!storeBaseUrl) continue;

      xml += `  <url>\n`;
      xml += `    <loc>${storeBaseUrl}/?product=${product.id}</loc>\n`;
      if (product.updated_at) {
        xml += `    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml; charset=utf-8' 
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
