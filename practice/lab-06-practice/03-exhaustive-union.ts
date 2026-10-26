// Експеримент 3 (§3): вичерпність union через never.
// Перевірка: npx tsc --noEmit       Запуск: npx tsx 03-exhaustive-union.ts
//
// Варіант 'chat' уже додано в union, а case для нього немає.
// Очікування від tsc: ОДНА помилка, TS2322 на const _x: never:
// тип { type: 'chat'; text: string } не можна присвоїти never.
// Додай case 'chat' (або прибери рядок з union), і помилка зникне.
type Msg =
  | { type: 'join'; name: string }
  | { type: 'input'; thrust: boolean }
  | { type: 'ping' }
  | { type: 'chat'; text: string }; // нова літера протоколу

function handle(m: Msg) {
  switch (m.type) {
    case 'join':
      return m.name;
    case 'input':
      return m.thrust;
    case 'ping':
      return 0;
    default: {
      const _x: never = m;
      return _x;
    }
  }
}

// У runtime 'chat' мовчки провалюється в default. Очікування: join -> ana, chat -> { type: 'chat', ... }.
// Саме тому помилку краще бачити в tsc, а не в проді.
console.log('join ->', handle({ type: 'join', name: 'ana' }));
console.log('chat ->', handle({ type: 'chat', text: 'привіт' }));
