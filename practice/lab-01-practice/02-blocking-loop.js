// Експеримент 2 (§2): стек ніхто не перериває.
// Запуск: node 02-blocking-loop.js
//
// setTimeout(fn, 0) означає "поклади fn у чергу", а не "виконай зараз".
// Спитай студентів ПЕРЕД запуском: що надрукується першим і коли?
//
// Очікування: ~2 с тиші, потім "done", потім "timer", і таймер
// запізнився на ~2000 мс, хоча просили 0.
// Те саме в браузері (сторінка не скролиться) показує browser.html, кнопка "заблокувати".
const t0 = performance.now();
setTimeout(() => {
  console.log(`timer: просили 0 мс, вийшло ${Math.round(performance.now() - t0)} мс`);
}, 0);

const t = Date.now();
while (Date.now() - t < 2000) {}
console.log(`done: через ${Math.round(performance.now() - t0)} мс`);
