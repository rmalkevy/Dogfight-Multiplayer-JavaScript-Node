// Експеримент 2 (§2): Map.get під strict.
// Перевірка: npx tsc --noEmit       Запуск: npx tsx 02-map-get-strict.ts
//
// Очікування від tsc: ОДНА помилка, TS2322 на рядку з s:
// get повертає string | undefined, а не string.
const m = new Map<number, string>();
const s: string = m.get(1);

// Три фікси з нотаток. Усі три компілюються.
const a: string = m.get(1)!; // ! — брешеш компілятору: у runtime тут undefined
const b: string = m.get(1) ?? '';
const c = m.get(1);
if (c !== undefined) {
  const d: string = c; // найчесніший: звузили перевіркою
  console.log('d', d);
}

// Очікування: s undefined, a undefined (хоча тип string!), b "".
console.log('s', s);
console.log('a', a, '| typeof a:', typeof a);
console.log('b', JSON.stringify(b));
