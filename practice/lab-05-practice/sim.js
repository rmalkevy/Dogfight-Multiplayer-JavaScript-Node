// Спільна симуляція для 05-determinism.js (Node) і browser.html (Chrome).
// Звичайний скрипт без import/export, щоб browser.html відкривався подвійним кліком (file://).
// У Node його підключає `import './sim.js'`, а функції лежать у globalThis.sim.
globalThis.sim = (() => {
  // Фізика та сама, що в dogfight/src/sim/ship.js
  const ROTATE_SPEED = 3.6;
  const THRUST = 520;
  const DRAG = 1.15;
  const MAX_SPEED = 380;
  const STEP = 1 / 60;

  function integrate(ship, input, dt) {
    if (input.left) ship.angle -= ROTATE_SPEED * dt;
    if (input.right) ship.angle += ROTATE_SPEED * dt;
    if (input.thrust) {
      ship.vx += Math.cos(ship.angle) * THRUST * dt;
      ship.vy += Math.sin(ship.angle) * THRUST * dt;
    }
    const damp = Math.exp(-DRAG * dt);
    ship.vx *= damp;
    ship.vy *= damp;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > MAX_SPEED) {
      ship.vx *= MAX_SPEED / speed;
      ship.vy *= MAX_SPEED / speed;
    }
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
  }

  // "Записаний" input: однаковий на кожному прогоні, без клавіатури.
  const inputAt = (n) => ({
    thrust: n % 120 < 80,
    left: n % 90 < 15,
    right: n % 200 > 185,
  });

  // Детермінований генератор випадкових чисел (mulberry32): той самий seed, та сама послідовність.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // FNV-1a по байтах Float64 усіх полів: однаковий стан до останнього біта -> однаковий хеш.
  function hash(ship) {
    const bytes = new Uint8Array(new Float64Array([ship.x, ship.y, ship.vx, ship.vy, ship.angle]).buffer);
    let h = 0x811c9dc5;
    for (const byte of bytes) h = Math.imul(h ^ byte, 0x01000193) >>> 0;
    return h.toString(16).padStart(8, '0');
  }

  // 1000 кроків з однаковим input. random: null (без шуму) або функція () => [0, 1).
  function run(steps = 1000, random = null) {
    const ship = { x: 400, y: 300, vx: 0, vy: 0, angle: -Math.PI / 2 };
    for (let n = 0; n < steps; n++) {
      if (random) ship.vx += (random() - 0.5) * 1e-6; // крихітний "вітер"
      integrate(ship, inputAt(n), STEP);
    }
    return { x: ship.x.toFixed(6), y: ship.y.toFixed(6), hash: hash(ship) };
  }

  return { run, mulberry32 };
})();
