const cartTotal = 1000;
const discountAmount = 0;
const dynamicRates = [{id: '1', cost: 5000}];
const availableShippingZones = [];
const selectedShippingId = '1';
const selectedShipping = [...availableShippingZones, ...dynamicRates].find(z => String(z.id) === String(selectedShippingId));
const finalTotal = Math.max(0, cartTotal - discountAmount) + (selectedShipping && Number(selectedShipping.cost) > 0 ? Number(selectedShipping.cost) : 0);
console.log({ cartTotal, selectedShippingCost: selectedShipping.cost, finalTotal });
