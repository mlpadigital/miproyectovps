const ENVIA_API_TOKEN = "12dace34014f2f7f258e5ad905160fa580ba3b55833adfe9ae3abd4834c99748";

const enviaPayload = {
    origin: {
    name: "Tienda", company: "Tienda", email: "info@t.com", phone: "1123456789",
    street: "Av", number: "1", district: "CABA", city: "Buenos Aires", state: "BA", country: "AR", postalCode: "1000", reference: ""
    },
    destination: {
    name: "Cliente", company: "", email: "c@e.com", phone: "1123456789",
    street: "Av", number: "2", district: "CABA", city: "Buenos Aires", state: "BA", country: "AR", postalCode: "1425", reference: ""
    },
    packages: [
        {
            content: "Caja", amount: 1, type: "box", weight: 1,
            dimensions: { length: 10, width: 10, height: 10 }
        }
    ],
    shipment: { carrier: "oca", type: 1 },
    settings: { currency: "ARS" }
};

fetch("https://api.envia.com/ship/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ENVIA_API_TOKEN}` },
    body: JSON.stringify(enviaPayload)
}).then(res => res.json()).then(console.log).catch(console.error);
