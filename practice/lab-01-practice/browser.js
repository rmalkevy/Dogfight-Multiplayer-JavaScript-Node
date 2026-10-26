// Браузерна частина Lab 01. Підключається з browser.html.
const out = document.getElementById('out');
const hud = document.getElementById('hud');
const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

function log(...args) {
  console.log(...args);
  out.textContent += args.join(' ') + '\n';
}
const header = (text) => log('\n--- ' + text);

// 1. Ігровий цикл (Lab 01, §3, §4): rAF + accumulator + фіксований крок.
// Те саме, що dogfight/src/loop.js, лише з одним рядком "фізики".
const SPEED = 200; // px за секунду
let step = 1 / 60;
const ship = { x: 0, previousX: 0 };

let last = 0;
let accumulator = 0;
let statsAt = 0;
let steps = 0;
let frames = 0;
let ticks = 0;
let ticksSinceFrame = 0;
let framesWithoutTick = 0;
let framesWithTwoTicks = 0;
let frameMs = 0;
let stats = 'зачекай секунду...';

// Фонова вкладка (§3): rAF стоїть, setInterval пригальмовано.
let totalTicks = 0;
let hiddenAt = 0;
let hiddenFor = 0;
let ticksAtHide = 0;
let ticksWhileHidden = 0;
let afterHidden = false;

// setInterval(16) крутиться поруч, щоб порівняти з кадрами.
// 16 мс != 16.67 мс, тож на 60 Hz деякі кадри отримують два тіки, а на 120 Hz половина кадрів жодного.
setInterval(() => {
  ticks += 1;
  ticksSinceFrame += 1;
  totalTicks += 1;
}, 16);

function simulate(dt) {
  ship.previousX = ship.x;
  ship.x += SPEED * dt;
  if (ship.x > canvas.width) {
    ship.x -= canvas.width;
    ship.previousX -= canvas.width; // не інтерполювати крізь усю арену
  }
}

function render(alpha) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#9ad1ff';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('з alpha', 8, 18);
  ctx.fillText('без alpha', 8, 78);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(ship.previousX + (ship.x - ship.previousX) * alpha, 40, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef476f';
  ctx.beginPath();
  ctx.arc(ship.x, 100, 10, 0, Math.PI * 2);
  ctx.fill();
}

function frame(now) {
  const dt = last === 0 ? 0 : (now - last) / 1000;
  last = now;
  frameMs = dt * 1000;
  if (afterHidden) {
    log(`після повернення: dt кадру ${Math.round(frameMs)} мс, clamp обрізає до 250 мс;`,
      `setInterval за ${Math.round(hiddenFor / 1000)} с у фоні тікнув ${ticksWhileHidden} разів`);
    afterHidden = false;
  }

  accumulator += Math.min(dt, 0.25);
  while (accumulator >= step) {
    simulate(step);
    accumulator -= step;
    steps += 1;
  }
  render(accumulator / step);

  frames += 1;
  if (ticksSinceFrame === 0) framesWithoutTick += 1;
  if (ticksSinceFrame >= 2) framesWithTwoTicks += 1;
  ticksSinceFrame = 0;

  if (now - statsAt >= 1000) {
    stats = [
      `steps/s      ${steps}   (крок симуляції ${Math.round(1 / step)} Hz)`,
      `frames/s     ${frames}   (rAF, = герци монітора)`,
      `setInterval  ${ticks}   (тіків за секунду, просили 16 мс)`,
      `кадрів без тіку setInterval: ${framesWithoutTick}, з двома й більше: ${framesWithTwoTicks}`,
    ].join('\n');
    steps = 0;
    frames = 0;
    ticks = 0;
    framesWithoutTick = 0;
    framesWithTwoTicks = 0;
    statsAt = now;
  }
  hud.textContent = `${stats}\nframe ms     ${frameMs.toFixed(2)}`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

document.getElementById('simHz').onchange = (e) => {
  step = 1 / Number(e.target.value);
  accumulator = 0;
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenAt = performance.now();
    ticksAtHide = totalTicks;
  } else {
    hiddenFor = performance.now() - hiddenAt;
    ticksWhileHidden = totalTicks - ticksAtHide;
    afterHidden = last !== 0; // сторінку могли відкрити одразу у фоні, тоді кадрів ще не було
  }
});

// 2. Стек ніхто не перериває (Lab 01, §2)
// Під час циклу спробуй поскролити або натиснути іншу кнопку: не вийде, лічильники стоять.
document.getElementById('block').onclick = () => {
  header('блокуючий цикл на 2 с');
  const t0 = performance.now();
  setTimeout(() => log(`timer: просили 0 мс, вийшло ${Math.round(performance.now() - t0)} мс`), 0);
  const t = Date.now();
  while (Date.now() - t < 2000) {}
  log('done');
};

// 3. 30 кадрів rAF (Lab 01, §3): код з нотаток, лише друк в один рядок
document.getElementById('raf30').onclick = () => {
  let lastFrame = 0;
  let n = 0;
  const dts = [];
  function tick(now) {
    if (lastFrame) dts.push((now - lastFrame).toFixed(2));
    lastFrame = now;
    n += 1;
    if (n < 30) requestAnimationFrame(tick);
    else {
      header('dt між кадрами rAF, мс');
      log(dts.join(' '));
    }
  }
  requestAnimationFrame(tick);
};

// Те саме для setInterval(16): порівняй з рядком rAF
document.getElementById('interval30').onclick = () => {
  let lastTick = 0;
  const dts = [];
  const id = setInterval(() => {
    const now = performance.now();
    if (lastTick) dts.push((now - lastTick).toFixed(2));
    lastTick = now;
    if (dts.length === 29) {
      clearInterval(id);
      header('dt між тіками setInterval(16), мс');
      log(dts.join(' '));
    }
  }, 16);
};

// 4. this у classic і module <script> (Lab 01, §6). Самі скрипти в browser.html.
document.getElementById('thisCheck').onclick = () => {
  header('this зверху скрипта');
  log('classic <script>: this === window ->', classicThis === window);
  log('module <script>:  this ->', String(window.moduleThis));
};

document.getElementById('clear').onclick = () => { out.textContent = ''; };
