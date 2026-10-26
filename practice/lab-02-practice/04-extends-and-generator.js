// Експеримент 4 ("Якщо лишився час"): два ланцюги extends і нескінченний генератор.
// Запуск: node 04-extends-and-generator.js
//
// Не брама для тега, це для співбесіди. Перед кожною частиною прогноз уголос.

// Частина A: код з нотаток. Очікування: true, true.
// Екземпляри: b -> B.prototype -> A.prototype. Самі класи (статики): B -> A.
console.log('--- A: два ланцюги');
class A {
  static kind() {
    return 'статик з A';
  }
}
class B extends A {}
console.log(Object.getPrototypeOf(B.prototype) === A.prototype);
console.log(Object.getPrototypeOf(B) === A);
console.log('B.kind():', B.kind()); // знайшовся вгору по ланцюгу функцій

// Частина B: генератор віддає значення по одному і не блокує, поки його не просять.
// Очікування: перші 10 чисел Фібоначчі, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34].
// [...fib()] НЕ роби: нескінченний генератор зависне, як while у Lab 1.
console.log('--- B: генератор');
function* fib() {
  let a = 0;
  let b = 1;
  for (;;) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const g = fib();
const first = [];
for (const n of g) {
  first.push(n);
  if (first.length === 10) break;
}
console.log(first);
