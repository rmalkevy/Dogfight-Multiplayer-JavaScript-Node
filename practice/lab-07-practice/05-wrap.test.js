// Експеримент 5 (§5): property test знаходить контрприклад у зламаній функції.
// Запуск:
//   npx vitest run --mode broken 05-wrap.test.js   -> падає, fast-check друкує Counterexample
//   npx vitest run 05-wrap.test.js                 -> виправлений wrap, проходить
//
// Властивість з лаби: "ships never leave the arena". Не один приклад, а сотня випадкових x і ширин.
// Спитай студентів ПЕРЕД запуском: на якому x зламаний wrap збреше?
//
// Очікування з --mode broken: Property failed, майже завжди Counterexample: [-1,2]
// (fast-check звузив, shrunk, до найменшого x і ширини, де результат < 0).
// Зрідка shrink зупиняється на іншій парі, наприклад [-4,3]: входи випадкові.
// Ширина 1 не годиться: -1 % 1 це -0, а -0 >= 0 правда.
import { test } from 'vitest';
import fc from 'fast-check';
import { wrap, wrapBroken } from './05-wrap.js';

const broken = import.meta.env.MODE === 'broken';
const subject = broken ? wrapBroken : wrap;

test(`${broken ? 'зламаний' : 'виправлений'} wrap лишає корабель в арені`, () => {
  fc.assert(
    fc.property(fc.integer({ min: -5000, max: 5000 }), fc.integer({ min: 1, max: 2000 }), (x, width) => {
      const result = subject(x, width);
      return result >= 0 && result < width;
    }),
  );
});
