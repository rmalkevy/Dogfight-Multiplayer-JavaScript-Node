// Експеримент 1 (§1): делегація, не копіювання.
// Запуск: node 01-delegation.js
//
// Спитай студентів ПЕРЕД запуском про кожну частину.

// Частина A: код з нотаток. Очікування: 1 false, true, потім 2.
// У b немає власного hello, читання йде вгору до a. Змінили a, і b бачить нове одразу.
console.log('--- A: Object.create');
const a = {};
const b = Object.create(a);
a.hello = 1;
console.log(b.hello, b.hasOwnProperty('hello'));
console.log(Object.getPrototypeOf(b) === a);
a.hello = 2;
console.log(b.hello);

// Частина B: те саме з class. Тисяча куль ділить ОДИН update з Bullet.prototype.
// Очікування: false, true; після заміни методу на прототипі стара куля вже кличе новий.
console.log('--- B: class, тисяча куль');
class Bullet {
  constructor(x) {
    this.x = x;
  }
  update() {
    this.x += 1;
    return 'старий update';
  }
}
const bullets = Array.from({ length: 1000 }, (_, i) => new Bullet(i));
const first = bullets[0];
console.log('власний update у кулі:', first.hasOwnProperty('update'));
console.log('у всіх куль той самий update:', bullets.every((bullet) => bullet.update === first.update));

Bullet.prototype.update = function () {
  this.x += 2;
  return 'новий update';
};
console.log('куля, створена ДО заміни:', bullets[999].update());
