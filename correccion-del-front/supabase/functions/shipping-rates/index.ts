import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ENVIA_API_TOKEN = Deno.env.get("ENVIA_API_TOKEN");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqBody = await req.json();
    const { originZip, destinationZip, packages, stateCode = "C" } = reqBody;
    const enabledCarriers = reqBody.enabledCarriers; // undefined if not sent

    if (!ENVIA_API_TOKEN) {
      throw new Error("ENVIA_API_TOKEN no está configurado en el servidor");
    }

    if (!originZip || !destinationZip || !packages || packages.length === 0) {
      throw new Error("Faltan parámetros obligatorios (originZip, destinationZip, packages)");
    }

    const enviaPayload = {
      origin: {
        name: "Tienda Origen",
        company: "Mi Tienda",
        email: "info@mitienda.com",
        phone: "1123456789",
        street: "Calle Falsa",
        number: "123",
        district: "Centro",
        city: "Ciudad",
        state: "BA",
        country: "AR",
        postalCode: String(originZip),
        reference: ""
      },
      destination: {
        name: "Cliente",
        company: "Cliente",
        email: "cliente@email.com",
        phone: "1123456789",
        street: "Calle Destino",
        number: "456",
        district: "Centro",
        city: "Ciudad Destino",
        state: stateCode,
        country: "AR",
        postalCode: String(destinationZip),
        category: 1
      },
      packages: packages.map((p: any) => ({
        content: "Productos físicos",
        amount: p.amount || 1,
        type: "box",
        dimensions: {
          length: p.length || 10,
          width: p.width || 10,
          height: p.height || 10
        },
        weight: p.weight || 1,
        insurance: 0,
        declaredValue: 0,
        weightUnit: "KG",
        lengthUnit: "CM"
      })),
      shipment: {
        type: 1
      },
      settings: {
        currency: "ARS"
      }
    };

    const validCarriers = ["correoargentino", "andreani", "oca"];
    
    // Default to all if none provided (for backwards compatibility), otherwise filter
    let carriers = validCarriers;
    if (enabledCarriers !== undefined) {
        carriers = enabledCarriers
            .map((c: string) => c === 'correo_argentino' ? 'correoargentino' : c)
            .filter((c: string) => validCarriers.includes(c));
    }

    if (carriers.length === 0) {
        return new Response(JSON.stringify({ data: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const responses = await Promise.all(
        carriers.map(async (carrier) => {
            const payload = { ...enviaPayload, shipment: { ...enviaPayload.shipment, carrier } };
            try {
                const res = await fetch("https://api.envia.com/ship/rate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${ENVIA_API_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || data.meta === 'error') {
                    console.error(`Error de Envia.com para ${carrier}:`, data);
                    return [];
                }
                return data.data || [];
            } catch (err) {
                console.error(`Fetch error para ${carrier}:`, err);
                return [];
            }
        })
    );

    const allRates = responses.flat();

    return new Response(
      JSON.stringify({ data: allRates }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
