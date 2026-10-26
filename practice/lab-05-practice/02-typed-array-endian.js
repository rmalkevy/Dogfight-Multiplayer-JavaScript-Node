// Експеримент 2 (§2): typed array сидить на endianness процесора.
// Запуск: node 02-typed-array-endian.js
//
// Uint16Array не питає, у якому порядку байти. Він бере порядок цієї машини.
// Спитай студентів ПЕРЕД запуском: що вийде з байтів [1, 0, 0, 1]?
import os from 'node:os';

// Очікування на little-endian машині (x86, Apple Silicon): [1, 256].
// [1, 0] -> 1, [0, 1] -> 256. На big-endian було б [256, 1].
console.log('ця машина:', os.endianness());
console.log(new Uint16Array(new Uint8Array([1, 0, 0, 1]).buffer));

// DataView з явним порядком дає те саме число на будь-якій машині.
// Очікування: 1 256.
const d = new DataView(new Uint8Array([1, 0, 0, 1]).buffer);
console.log('DataView, little-endian:', d.getUint16(0, true), d.getUint16(2, true));
