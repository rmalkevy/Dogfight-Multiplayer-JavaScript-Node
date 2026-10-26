// Експеримент 1 (§1): задача проти мікрозадачі.
// Запуск: node 01-task-vs-microtask.js
//
// Кожна частина друкується з паузою між ними, щоб виводи не змішувались.
// Перед кожною частиною зупиняйся і проси прогноз уголос.
const pause = () => new Promise((resolve) => setTimeout(resolve, 50));

// Частина A: код з нотаток. Очікування: 1, 4, 3, 2
console.log('--- A');
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
await pause();

// Частина B: додаємо queueMicrotask. Очікування: 1, 4, 3, 5, 2
// Обидві мікрозадачі раніше за таймер.
console.log('--- B');
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('5'));
console.log('4');
await pause();

// Частина C: мікрозадачі виконуються ВСІ, поки черга не спорожніє.
// Ланцюжок мікрозадач крутиться 200 мс, і таймер з 0 мс чекає весь цей час.
// Очікування: спершу "ланцюжок мікрозадач", потім "таймер: через ~200 мс".
console.log('--- C');
let t0 = performance.now();
const since = () => Math.round(performance.now() - t0);
setTimeout(() => console.log(`таймер: через ${since()} мс`), 0);
let steps = 0;
function micro() {
  steps += 1;
  if (performance.now() - t0 < 200) queueMicrotask(micro);
  else console.log(`ланцюжок мікрозадач: ${steps} кроків за ${since()} мс`);
}
queueMicrotask(micro);
await pause();

// Частина D: той самий ланцюжок, але на setTimeout. Задача береться ОДНА за раз,
// тож наш таймер проходить між кроками ланцюжка.
// Очікування: "таймер: через ~1 мс", а ланцюжок закінчується пізніше.
// У браузері так само: між задачами встигає намалюватись кадр.
console.log('--- D');
t0 = performance.now();
steps = 0;
function task() {
  steps += 1;
  if (performance.now() - t0 < 200) setTimeout(task, 0);
  else console.log(`ланцюжок таймерів: ${steps} кроків за ${since()} мс`);
}
setTimeout(task, 0);
setTimeout(() => console.log(`таймер: через ${since()} мс`), 0);
