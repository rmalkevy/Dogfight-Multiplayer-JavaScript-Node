// Експеримент 1 (§1): deopt на очах.
// Запуск: node --allow-natives-syntax 01-deopt.js
// Причина deopt словами:
//   node --allow-natives-syntax --trace-deopt 01-deopt.js | grep 'JSFunction add'
//
// %GetOptimizationStatus і %OptimizeFunctionOnNextCall — внутрішні функції V8,
// без прапорця --allow-natives-syntax файл навіть не розпарситься (SyntaxError).
//
// Очікування: після оптимізації статус > 1 (є прапорці оптимізованого коду),
// після add('a', 'b') статус 1: лишився тільки біт "це функція", функцію викинуто в інтерпретатор.
// Точне число до deopt залежить від версії V8 (на Node 26: 41, на Node 22: 81).
// У --trace-deopt: reason: not a Smi — чекали мале ціле, прийшов рядок.
function add(a, b) {
  return a + b;
}
const status = () => {
  const s = %GetOptimizationStatus(add);
  return `${s} (0b${s.toString(2)})`;
};

// Вимога сучасного V8: на Node 26 без цього рядка Node падає з
// "should be prepared for optimization with %PrepareFunctionForOptimization" (на Node 22 ще ні).
%PrepareFunctionForOptimization(add);
for (let i = 0; i < 1e6; i++) add(i, 1);
%OptimizeFunctionOnNextCall(add);
add(1, 2);
console.log('після оптимізації:', status());

add('a', 'b'); // число + рядок: припущення "тут завжди числа" зламалось
console.log('після add(a, b): ', status());
