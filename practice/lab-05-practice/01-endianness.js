// Експеримент 1 (§1): endianness, порядок байтів у числі.
// Запуск: node 01-endianness.js
//
// Спитай студентів ПЕРЕД запуском про кожну частину.

// Частина A: код з нотаток. Очікування: ті самі чотири байти в протилежному порядку,
// LE 0 0 192 63 0 0 0 0, BE 63 192 0 0 0 0 0 0.
console.log('--- A: setFloat32(1.5)');
const b = new ArrayBuffer(8);
const v = new DataView(b);
v.setFloat32(0, 1.5, true);
console.log('LE', [...new Uint8Array(b)].join(' '));
v.setFloat32(0, 1.5, false);
console.log('BE', [...new Uint8Array(b)].join(' '));

// Частина B: читаємо два байти [1, 0] як Uint16.
// Очікування: з true 1, з false 256, БЕЗ аргументу теж 256.
// DataView за замовчуванням big-endian. Забув true у одному місці протоколу,
// і сервер з клієнтом читають різні числа.
console.log('--- B: getUint16 на байтах [1, 0]');
const two = new DataView(new Uint8Array([1, 0]).buffer);
console.log('getUint16(0, true) ', two.getUint16(0, true));
console.log('getUint16(0, false)', two.getUint16(0, false));
console.log('getUint16(0)       ', two.getUint16(0));
