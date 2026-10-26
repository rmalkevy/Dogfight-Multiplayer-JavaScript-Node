// Експеримент 6 (§6): модулі одним дослідом.
// Запуск: node 06-modules.js
//
// Модуль 06-counter.js імпортується тут тричі. Спитай ПЕРЕД запуском:
// скільки разів надрукується "[06-counter.js] тіло модуля виконується"?
// Статичні import виконуються до першого рядка цього файлу, тому рядок
// з 06-counter.js з'явиться раніше за "--- A".
import { bump } from './06-counter.js';
import * as again from './06-counter.js';

// Частина A: тіло модуля виконується один раз, усі import бачать той самий стан.
// Очікування: рядок з 06-counter.js лише один раз (над "--- A");
// bump() двічі дає 1 і 2; динамічний import віддає той самий об'єкт модуля, true.
console.log('--- A: один модуль, один стан');
console.log('bump():', bump());
console.log('again.bump():', again.bump());
const dynamic = await import('./06-counter.js');
console.log('динамічний import той самий модуль:', dynamic === again);
console.log(dynamic.describe());

// Частина B: свій скоуп. const з іншого файлу не видно без export/import.
// Очікування: typeof hidden -> undefined.
console.log('--- B: свій скоуп');
console.log('typeof hidden:', typeof hidden);

// Частина C: this зверху модуля і strict mode.
// Очікування: this -> undefined; присвоєння неоголошеній змінній -> ReferenceError.
// У браузері порівняння classic і module <script> показує browser.html.
console.log('--- C: this і strict');
console.log('this зверху модуля:', this);
try {
  undeclared = 1;
} catch (e) {
  console.log('undeclared = 1 ->', e.name);
}
