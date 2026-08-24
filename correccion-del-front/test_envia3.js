const ENVIA_API_TOKEN = "12dace34014f2f7f258e5ad905160fa580ba3b55833adfe9ae3abd4834c99748";

const enviaPayload = {
    origin: {
    name: "Tienda Origen",
    company: "Mi Tienda",
    email: "info@mitienda.com",
    phone: "1123456789",
    street: "Calle Falsa",
    number: "123",
    district: "Centro",
    city: "Buenos Aires",
    state: "BA",
    country: "AR",
    postalCode: "1000",
    reference: ""
    },
    destination: {
    name: "Cliente",
    company: "",
    email: "cliente@email.com",
    phone: "1123456789",
    street: "Calle Destino",
    number: "456",
    district: "Centro",
    city: "Buenos Aires",
    state: "BA",
    country: "AR",
    postalCode: "2000",
    reference: ""
    },
    packages: [
        {
            content: "Productos fisicos",
            amount: 1,
            type: "box",
            weight: 1,
            dimensions: {
                length: 10,
                width: 10,
                height: 10
            }
        }
    ],
    shipment: {
    carrier: "andreani",
    type: 1
    },
    settings: {
    currency: "ARS"
    }
};

fetch("https://api.envia.com/ship/rate", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ENVIA_API_TOKEN}`
    },
    body: JSON.stringify(enviaPayload)
}).then(res => res.json()).then(console.log).catch(console.error);
