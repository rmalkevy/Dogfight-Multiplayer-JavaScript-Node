// Експеримент 4 (§4, і clamp з §3): фіксований крок не залежить від герців екрана.
// Запуск: node 04-fixed-step.js
//
// Тут немає ні браузера, ні справжніх кадрів: ми самі "граємо" 1 секунду
// на моніторах 30, 60, 120 і 144 Hz і дивимось, де опинився корабель.
// Корабель летить праворуч з увімкненим газом; фізика та сама, що в
// dogfight/src/sim/ship.js (розгін + опір).
// Як це виглядає з alpha на справжньому екрані, показує browser.html.
const THRUST = 520;
const DRAG = 1.15;
const STEP = 1 / 60;
const RATES = [30, 60, 120, 144];

function integrate(ship, dt) {
  ship.vx += THRUST * dt;
  ship.vx *= Math.exp(-DRAG * dt);
  ship.x += ship.vx * dt;
}

const row = (hz, text) => console.log(`  ${String(hz).padStart(3)} Hz: ${text}`);

// Частина A: рух "на кадр". Очікування: на 120 Hz удвічі далі, ніж на 60.
console.log('--- A: x += 5 за кадр');
for (const hz of RATES) {
  let x = 0;
  for (let frame = 0; frame < hz; frame++) x += 5;
  row(hz, `x = ${x}`);
}

// Частина B: velocity * dt зі справжнім часом кадру.
// Очікування: близько, але НЕ однаково. Для мультиплеєра (Lab 5) це вже розбіжність.
console.log('--- B: integrate(ship, dt кадру)');
for (const hz of RATES) {
  const ship = { x: 0, vx: 0 };
  for (let frame = 0; frame < hz; frame++) integrate(ship, 1 / hz);
  row(hz, `x = ${ship.x.toFixed(4)}`);
}

// Частина C: accumulator і фіксований крок 1/60, як у dogfight/src/loop.js.
// Рендер малює не останній стан, а lerp(previous, current, alpha).
// Очікування: "на екрані" однаковий x (~179.17) на всіх герцах.
// На 144 Hz похибка float дасть 59 кроків і alpha 1.00 замість 60 і 0.00:
// шістдесятий крок прийде наступним кадром, а на екрані та сама точка.
console.log('--- C: фіксований крок 1/60');
for (const hz of RATES) {
  const ship = { x: 0, vx: 0 };
  let previousX = 0;
  let accumulator = 0;
  let steps = 0;
  let alpha = 0;
  for (let frame = 0; frame < hz; frame++) {
    accumulator += 1 / hz;
    while (accumulator >= STEP) {
      previousX = ship.x;
      integrate(ship, STEP);
      accumulator -= STEP;
      steps += 1;
    }
    alpha = accumulator / STEP;
  }
  const onScreen = previousX + (ship.x - previousX) * alpha;
  row(hz, `кроків ${steps}, alpha ${alpha.toFixed(2)}, на екрані x = ${onScreen.toFixed(4)}`);
}

// Частина D (§3): вкладку згорнули на 5 с, наступний кадр приніс dt = 5.
// Очікування: без clamp 300 кроків за один кадр, з Math.min(dt, 0.25) лише 15.
console.log('--- D: кадр після паузи, dt = 5 с');
for (const clamp of [false, true]) {
  let accumulator = clamp ? Math.min(5, 0.25) : 5;
  let steps = 0;
  while (accumulator >= STEP) {
    accumulator -= STEP;
    steps += 1;
  }
  console.log(`  ${clamp ? 'з clamp 0.25:' : 'без clamp:   '} ${steps} кроків симуляції в одному кадрі`);
}
