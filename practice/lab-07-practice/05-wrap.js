// Допоміжний модуль для 05-wrap.test.js. Окремо не запускається.
// Виліт за край арени: поява з іншого боку (Lab 1, M2).

// Навмисно зламано: для x < 0 залишок від % теж від'ємний, і корабель лишається за лівим краєм.
export function wrapBroken(x, width) {
  return x % width;
}

// Виправлено, як у dogfight/src/sim/arena.js
export function wrap(x, width) {
  return ((x % width) + width) % width;
}
