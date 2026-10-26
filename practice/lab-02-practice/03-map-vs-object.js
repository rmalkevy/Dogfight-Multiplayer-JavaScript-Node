// Експеримент 3 (§3): Map проти об'єкта як словника.
// Запуск: node 03-map-vs-object.js
//
// Для id сутностей у грі Map/Set, не {}. Ось три причини.

// Частина A: код з нотаток. Очікування: x x, x undefined, [ '1', '[object Object]' ].
// У об'єкта ключі стають рядками. У Map 1 і '1' різні ключі.
console.log('--- A: ключі');
const o = { 1: 'x' };
const m = new Map([[1, 'x']]);
console.log(o[1], o['1']);
console.log(m.get(1), m.get('1'));
const k = {};
o[k] = 1;
console.log(Object.keys(o));

// Те саме з об'єктом-ключем у Map: ключ лишається об'єктом.
// Очікування: true, 1.
const ships = new Map();
ships.set(k, 1);
console.log('Map: ключ той самий об\'єкт:', [...ships.keys()][0] === k, ships.get(k));

// Частина B: id "__proto__" (наприклад, ім'я гравця з мережі).
// Очікування: в об'єкті запис "зникає" і міняє прототип; у Map це звичайний ключ.
console.log('--- B: ключ __proto__');
const byName = {};
byName['__proto__'] = { hacked: true };
console.log('Object.keys:', Object.keys(byName), '| byName.hacked:', byName.hacked);
const byNameMap = new Map();
byNameMap.set('__proto__', { hacked: true });
console.log('Map keys:', [...byNameMap.keys()], '| size:', byNameMap.size);

// Частина C: порядок. Сутності з'являються в порядку 10, 2, 'b', 1.
// Очікування: об'єкт сортує "числові" ключі: 1, 2, 10, b. Map тримає порядок вставки.
console.log('--- C: порядок');
const world = {};
const worldMap = new Map();
for (const id of [10, 2, 'b', 1]) {
  world[id] = id;
  worldMap.set(id, id);
}
console.log('об\'єкт:', Object.keys(world));
console.log('Map:   ', [...worldMap.keys()]);
