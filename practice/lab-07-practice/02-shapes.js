// Експеримент 2 (§2): форма об'єктів проти TypedArray, 1 млн елементів.
// Запуск: node 02-shapes.js
//
// Спитай студентів ПЕРЕД запуском: що швидше, mono чи poly? А Float32Array?
//
// Об'єкти з однаковими полями в однаковому порядку мають одну форму (hidden class).
// Доступ arr[i].x кешується за формою: 1 форма — monomorphic, 2-4 — polymorphic, більше — megamorphic.
const n = 1e6;
const withShapes = (shapes) =>
  Array.from({ length: n }, (_, i) => {
    const o = { x: i, y: i };
    if (i % shapes !== 0) o['k' + (i % shapes)] = 0; // зайве поле "іноді" -> нова форма
    return o;
  });

// Частина A: код з нотаток. Кожен десятий об'єкт має ще й z: дві форми.
// Очікування: різниця мала або її немає, poly може бути навіть швидшим, бо mono платить за компіляцію.
// Дві форми V8 кешує майже так само дешево, як одну.
console.log('--- A: код з нотаток');
const a = Array.from({ length: n }, (_, i) => ({ x: i, y: i }));
const b = Array.from({ length: n }, (_, i) => (i % 10 === 0 ? { x: i, y: i, z: 0 } : { x: i, y: i }));
function sumX(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i].x;
  return s;
}
console.time('mono');
sumX(a);
console.timeEnd('mono');
console.time('poly');
sumX(b);
console.timeEnd('poly');

// Частина B: найкращий з 5 прогонів, кожен варіант своєю функцією,
// щоб V8 збирав для кожного окрему статистику форм.
// Очікування: 2 форми (тут навпіл) трохи повільніші за 1, ~1.5 раза;
// 8 форм (megamorphic) ~3 рази повільніші; Float32Array найшвидший:
// ні об'єктів, ні форм, ні роботи для GC.
console.log('--- B: найкращий з 5 прогонів');
function sumMono(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i].x;
  return s;
}
function sumTwo(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i].x;
  return s;
}
function sumEight(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i].x;
  return s;
}
function sumFloat32(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s;
}
function best(fn, arr) {
  let ms = Infinity;
  for (let k = 0; k < 5; k++) {
    const t0 = performance.now();
    fn(arr);
    ms = Math.min(ms, performance.now() - t0);
  }
  return ms.toFixed(2).padStart(5) + ' мс';
}
const mono = withShapes(1);
const eight = withShapes(8);
console.log('1 форма     ', best(sumMono, mono));
console.log('2 форми     ', best(sumTwo, withShapes(2)));
console.log('8 форм      ', best(sumEight, eight));
console.log('Float32Array', best(sumFloat32, Float32Array.from({ length: n }, (_, i) => i)));

// Частина C: та сама sumMono, але один раз даємо їй масив з 8 формами.
// Очікування: після цього sumMono і на чистому масиві повільна, як sumEight або й гірше.
// Кеш форм у гарячій функції не "очищується" сам: одна форма-порушник псує її для всіх.
console.log('--- C: sumMono після одного виклику з 8 формами');
sumMono(eight);
console.log('1 форма     ', best(sumMono, mono));
