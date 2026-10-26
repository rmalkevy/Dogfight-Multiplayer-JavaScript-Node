// Експеримент 3 (§3): профіль синтетичного ігрового циклу.
// Запуск: node --cpu-prof --cpu-prof-dir=profiles 03-profile.js
//   -> profiles/CPU.<дата>.<pid>.cpuprofile; де його відкрити, у README.
// GC окремо: node --trace-gc 03-profile.js | head -20
//
// Цикл ~3 с крутить кроки симуляції без таймерів: щокроку 50 нових куль
// (new щокадру, без pool), рух, наївні колізії з 20 кораблями, прибирання мертвих.
// Спитай студентів ПЕРЕД відкриттям профілю: яка функція буде найгарячішою?
// Очікування (Self time): зверху collide (~80%), далі updateBullets (~10%),
// (anonymous) — стрілка з filter, evaluateSync — сам цикл верхнього рівня модуля,
// і окремим рядком (garbage collector), кілька відсотків:
// ціна нових об'єктів щокроку. spawnBullets сам по собі дешевий, менше 1%.
const SHIPS = Array.from({ length: 20 }, (_, i) => ({ x: i * 40, y: 300, r: 12 }));
const STEP = 1 / 60;
let bullets = [];
let hits = 0;

function spawnBullets() {
  for (let i = 0; i < 50; i++) {
    bullets.push({ x: Math.random() * 800, y: Math.random() * 600, vx: 300, vy: -200, life: 1 });
  }
}

function updateBullets() {
  for (const b of bullets) {
    b.x += b.vx * STEP;
    b.y += b.vy * STEP;
    b.life -= STEP;
  }
  bullets = bullets.filter((b) => b.life > 0); // новий масив щокроку
}

function collide() {
  for (const b of bullets) {
    for (const s of SHIPS) {
      const dx = b.x - s.x;
      const dy = b.y - s.y;
      if (dx * dx + dy * dy < s.r * s.r) {
        hits += 1;
        b.life = 0;
      }
    }
  }
}

const t0 = performance.now();
let steps = 0;
while (performance.now() - t0 < 3000) {
  spawnBullets();
  updateBullets();
  collide();
  steps += 1;
}
const ms = performance.now() - t0;
console.log(`кроків ${steps} за ${Math.round(ms)} мс, ${(ms / steps).toFixed(3)} мс на крок`);
console.log(`куль живих ${bullets.length}, влучань ${hits}`);
