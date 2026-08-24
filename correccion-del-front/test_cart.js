const cartTotal = 1000;
const discountAmount = 0;
const selectedShipping = { cost: "3500" };

const finalTotal = Math.max(0, cartTotal - discountAmount) + (selectedShipping && selectedShipping.cost > 0 ? selectedShipping.cost : 0);

console.log("finalTotal:", finalTotal);
console.log("Number finalTotal:", Number(finalTotal));
