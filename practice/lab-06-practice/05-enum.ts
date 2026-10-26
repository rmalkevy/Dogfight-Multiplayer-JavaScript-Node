// Експеримент 5 (§5): enum не зрізається, його треба компілювати.
// Перевірка: npx tsc --noEmit       Запуск: node 05-enum.ts   (впаде), потім npx tsx 05-enum.ts
//
// Очікування від tsc: ОДНА помилка, TS1294 на enum (у tsconfig увімкнено erasableSyntaxOnly).
// Очікування від node: ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX, enum is not supported in strip-only mode.
// tsx компілює enum сам, тому з ним файл запуститься. Заміна без enum: 06-as-const.ts.
enum Kind {
  ship = 'ship',
  bullet = 'bullet',
}

console.log('Kind.ship =', Kind.ship);
