// Експеримент 5 (§5), частина з нотаток: Math.fround(x) === x.
// Запуск:
//   npx vitest run 05-fround.test.js                 -> лише fc.float({ noNaN: true }), проходить
//   npx vitest run --mode broken 05-fround.test.js   -> ще й fc.float() без noNaN і fc.double()
//
// Спитай ПЕРЕД запуском з --mode broken: чи пройде fc.float()? А fc.double()?
//
// Очікування з --mode broken (входи випадкові, запусти кілька разів):
//   fc.float() без noNaN     -> здебільшого проходить, але приблизно
//                               в кожному п'ятому запуску падає: Counterexample: [Number.NaN],
//                               бо NaN === NaN це false. fc.float() генерує й NaN, якщо не сказати noNaN.
//   fc.double()              -> падає завжди: Counterexample: [5e-324] або [-5e-324]
//                               (найменший double, якого немає у float32)
import { test } from 'vitest';
import fc from 'fast-check';

const broken = import.meta.env.MODE === 'broken';

test('fc.float({ noNaN: true }): float32 переживає fround', () => {
  fc.assert(fc.property(fc.float({ noNaN: true }), (x) => Math.fround(x) === x));
});

test.runIf(broken)('fc.float() без noNaN', () => {
  fc.assert(fc.property(fc.float(), (x) => Math.fround(x) === x));
});

test.runIf(broken)('fc.double()', () => {
  fc.assert(fc.property(fc.double(), (x) => Math.fround(x) === x));
});
