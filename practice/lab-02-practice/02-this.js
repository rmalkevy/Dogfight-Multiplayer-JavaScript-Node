// Експеримент 2 (§2): чотири правила this.
// Запуск: node 02-this.js
//
// this визначається в момент виклику, а не тим, "чия" функція.
// Порядок: new -> call/apply/bind -> obj.f() -> голий f() (undefined у strict).
// Модулі й класи завжди strict. Перед кожною частиною проси прогноз уголос.

// Частина A: код з нотаток. Очікування: bare undefined, call A {}.
console.log('--- A: obj.f() проти голого f()');
class A {
  m() {
    return this;
  }
}
const a = new A();
const m = a.m;
console.log('obj.f()', a.m());
console.log('bare', m());
console.log('call', m.call(a));

// Частина B: загублений this у колбеку. Типовий баг гри з нотаток:
// canvas.addEventListener('click', ship.fire). Тут замість canvas EventTarget з Node,
// він так само кличе слухача з this = сам target.
// Очікування: this це EventTarget, ammo стає NaN, і жодної помилки.
console.log('--- B: метод як колбек');
class Ship {
  ammo = 3;
  fire() {
    this.ammo -= 1;
    return this.ammo;
  }
}
const canvas = new EventTarget();
const ship = new Ship();
canvas.addEventListener('click', function () {
  console.log('this у слухачі:', this.constructor.name);
});
canvas.addEventListener('click', ship.fire);
canvas.dispatchEvent(new Event('click'));
console.log('ship.ammo:', ship.ammo, '| canvas.ammo:', canvas.ammo);

// Частина C: три виправлення з нотаток, усі три слухачі на одному кліку.
// Очікування: ship 3 -> 1 (обгортка і bind, обидва влучили в ship), fixed 3 -> 2.
// Стрілка не має свого this, бере його з місця, де її написали.
console.log('--- C: стрілка, bind, поле-стрілка');
class SafeShip {
  ammo = 3;
  fire = () => {
    this.ammo -= 1;
  };
}
const fixed = new SafeShip();
const target = new EventTarget();
target.addEventListener('click', () => ship.fire());
target.addEventListener('click', ship.fire.bind(ship));
target.addEventListener('click', fixed.fire);
const before = ship.ammo;
target.dispatchEvent(new Event('click'));
console.log(`ship: ${before} -> ${ship.ammo} (обгортка і bind), fixed: 3 -> ${fixed.ammo} (поле-стрілка)`);

// Частина D: new сильніший за bind. Очікування: false, новий об'єкт.
console.log('--- D: new');
function Point() {
  this.created = true;
}
const bound = Point.bind({ name: 'bind-ціль' });
const p = new bound();
console.log('new ігнорує bind-ціль:', p.name === 'bind-ціль', p);
