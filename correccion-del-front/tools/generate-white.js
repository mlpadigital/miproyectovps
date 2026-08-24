const { createCanvas } = require('canvas');
const canvas = createCanvas(1920, 1080);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 1920, 1080);
console.log(canvas.toDataURL('image/jpeg'));
