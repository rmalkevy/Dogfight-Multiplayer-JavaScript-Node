// Експеримент 2: 'error' без слухача валить процес.
// Запуск:
//   node 02-emitter-error.js          -> процес падає
//   node 02-emitter-error.js --fix    -> із слухачем, процес живий
import { EventEmitter } from 'node:events';

export const EVENT_CUT_PRICES = 'EVENT_CUT_PRICES';

const emitter = new EventEmitter();

if (process.argv.includes('--fix')) {
  emitter.on('error', (err) => console.log('перехопив помилку:', err.message));
}
emitter.on(EVENT_CUT_PRICES, (value) => {
  console.log(value)
})

console.log('перед emit');
emitter.emit('error', new Error('boom'));
emitter.emit(EVENT_CUT_PRICES, "Cut prices to the playstation")
console.log('після emit: якщо ти це бачиш, процес вижив');

