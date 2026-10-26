// Експеримент 6 (§5): as const замість enum. Зрізається без компіляції.
// Перевірка: npx tsc --noEmit       Запуск: node 06-as-const.ts   (без tsx!)
//
// Очікування від tsc: жодної помилки в цьому файлі.
// Очікування від node: Kind.ship = ship, потім двічі spawn bullet.
const Kind = { ship: 'ship', bullet: 'bullet' } as const;
type Kind = (typeof Kind)[keyof typeof Kind];

function spawn(kind: Kind) {
  return `spawn ${kind}`;
}

console.log('Kind.ship =', Kind.ship);
console.log(spawn(Kind.bullet));
console.log(spawn('bullet')); // union рядків: літерал теж підходить
