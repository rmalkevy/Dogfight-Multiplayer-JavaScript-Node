// Експеримент 3 (§3): JSON проти бінарного знімка.
// Запуск: node 03-json-vs-binary.js
//
// Спитай студентів ПЕРЕД запуском: у скільки разів JSON більший?
// Формат запису: id Uint16, x, y, angle Float32, усе little-endian.
// Це 14 байтів; беремо крок 16, як у нотатках.
const RECORD = 16;

function makeShips(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 100.5,
    y: 200.25,
    angle: 1.23,
  }));
}

function encodeJson(ships) {
  return new TextEncoder().encode(JSON.stringify(ships));
}

function encodeBinary(ships) {
  const buf = new ArrayBuffer(ships.length * RECORD);
  const d = new DataView(buf);
  ships.forEach((s, i) => {
    const o = i * RECORD;
    d.setUint16(o, s.id, true);
    d.setFloat32(o + 2, s.x, true);
    d.setFloat32(o + 6, s.y, true);
    d.setFloat32(o + 10, s.angle, true);
  });
  return buf;
}

// Частина A: код з нотаток, 8 кораблів. Очікування: json 345, binary 128.
console.log('--- A: 8 кораблів');
const eight = makeShips(8);
console.log('json bytes  ', encodeJson(eight).byteLength);
console.log('binary bytes', encodeBinary(eight).byteLength);

// Частина B: 20 сутностей, знімок 30 разів на секунду.
// Очікування: json ~870 байтів, binary 320; на 30 Hz це ~26 KB/s проти ~9.6 KB/s на кожного клієнта.
console.log('--- B: 20 сутностей, 30 Hz');
const twenty = makeShips(20);
const jsonBytes = encodeJson(twenty).byteLength;
const binaryBytes = encodeBinary(twenty).byteLength;
const kbs = (bytes) => ((bytes * 30) / 1000).toFixed(1) + ' KB/s';
console.log(`json   ${jsonBytes} байтів, ${kbs(jsonBytes)}`);
console.log(`binary ${binaryBytes} байтів, ${kbs(binaryBytes)}`);
console.log(`JSON більший у ${(jsonBytes / binaryBytes).toFixed(1)} раза`);

// Частина C: час серіалізації, 10 000 знімків по 20 сутностей.
// Очікування: binary у кілька разів швидший. Точні мс залежать від машини.
console.log('--- C: 10 000 знімків');
const ITERATIONS = 10_000;
for (const [name, encode] of [['json  ', encodeJson], ['binary', encodeBinary]]) {
  for (let i = 0; i < 1000; i++) encode(twenty); // розігрів JIT, щоб не міряти компіляцію
  const t0 = performance.now();
  for (let i = 0; i < ITERATIONS; i++) encode(twenty);
  console.log(`${name} ${Math.round(performance.now() - t0)} мс`);
}
