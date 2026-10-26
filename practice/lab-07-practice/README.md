# Lab 07: практика

Експерименти до [Lab 07](../../lab-07-engine-performance-testing.md) і його [нотаток](../../lab-07-engine-performance-testing.notes.md).
Кожен файл запускається окремо й показує одну ідею.

## Перший запуск

```bash
cd practice/lab-07-practice
npm install        # ставить vitest і fast-check
```

Потрібен Node 22+ (перевірити: `node -v`). Для `01`–`04` пакети не потрібні, лише для тестів `05`.

## Порядок показу

| Файл | Запуск | Розділ нотаток | Що показує |
|---|---|---|---|
| `01-deopt.js` | `node --allow-natives-syntax 01-deopt.js` | §1 | `%GetOptimizationStatus` до і після `add('a', 'b')`: 41 → 1 на Node 26, 81 → 1 на Node 22 |
| | `node --allow-natives-syntax --trace-deopt 01-deopt.js \| grep 'JSFunction add'` | §1 | причина словами: `reason: not a Smi` |
| `02-shapes.js` | `node 02-shapes.js` | §2 | код з нотаток; 1, 2 і 8 форм і `Float32Array` на 1 млн елементів; функція, «зіпсована» вісьмома формами |
| `03-profile.js` | `node --cpu-prof --cpu-prof-dir=profiles 03-profile.js` | §3 | синтетичний цикл з `new` щокроку; профіль у `profiles/` |
| `03-top.js` | `node 03-top.js` | §3 | топ функцій за self time з останнього профілю: `collide` ~80 %, `(garbage collector)` кілька % |
| | `node --trace-gc 03-profile.js \| head -20` | §3 | кожна збірка сміття окремим рядком (`Scavenge … ms`) |
| `04-transfer.js` | `node 04-transfer.js` | §4 | `left 52428800` проти `left 0`; transfer в один бік виграє ~2 рази, в обидва — у рази |
| `browser.html` | відкрити в браузері | §4 | код з нотаток: Worker з Blob, clone проти transfer |
| `05-wrap.test.js` | `npx vitest run --mode broken 05-wrap.test.js`, потім без `--mode broken` | §5 | зламаний `wrap`: `Counterexample: [-1,2]`; виправлений проходить |
| `05-fround.test.js` | `npx vitest run --mode broken 05-fround.test.js`, потім без `--mode broken` | §5 | `fc.float()` без `noNaN`: `NaN` приблизно раз на п'ять запусків; `fc.double()`: `[5e-324]` або `[-5e-324]` |

`npx vitest run` без аргументів проганяє обидва тестові файли з виправленими варіантами: `2 passed | 2 skipped`.
З `--mode broken`: `2 failed | 2 passed`, а якщо `fc.float()` натрапить на `NaN`, то `3 failed | 1 passed`.

## Де відкрити профіль

`03-profile.js` пише `profiles/CPU.<дата>.<pid>.cpuprofile` (тека в `.gitignore`).

- Без DevTools: `node 03-top.js` друкує топ функцій.
- Chrome: DevTools → **Performance** → кнопка **Load profile** (стрілка вгору) → вибрати файл. Далі вкладка **Bottom-Up**, сортування за **Self time**.
- VS Code відкриває `.cpuprofile` подвійним кліком (таблиця з self time).

## Примітки для показу

- `01`: без `%PrepareFunctionForOptimization` Node 26 падає з fatal error
  `should be prepared for optimization with %PrepareFunctionForOptimization`; Node 22 ще працює й без нього. Статус після оптимізації: 41 на Node 26, 81 на Node 22.
  Розшифровку бітів статусу тут не даємо: таблиця залежить від версії V8. Надійно лише одне: `1` означає «тільки біт "це функція"», оптимізованого коду немає.
- `02`, частина A: `poly` з двома формами **не** повільніший за `mono`; буває навіть швидшим, бо перший вимір платить за компіляцію.
  Дві форми V8 кешує майже так само дешево, як одну. Різницю видно з вісьмома формами (megamorphic, про це розділ лаби про hidden classes):
  частина B, ~1.3 мс проти ~3.9 мс. Частина C: та сама функція після одного виклику з вісьмома формами лишається повільною і на чистому масиві.
- `02`, `03`, `04`: мілісекунди залежать від машини і плавають від запуску до запуску. Стабільні співвідношення, `left` і порядок у топі профілю.
- `04`, частина A: echo з нотаток віддає буфер назад через clone, тому transfer виграє лише ~2 рази. Частина B: worker теж робить transfer, і тоді 0.3–1.5 мс проти кількох мс.
- `browser.html`: числа в Chrome більші й шумніші, ніж у Node (clone 80–560 мс, transfer 40–130 мс у нашому прогоні), `left` той самий.
  Перевірено через локальний сервер; подвійним кліком (`file://`) не перевіряли. Якщо Worker з Blob не створюється,
  запусти `python3 -m http.server` у цій теці й відкрий `http://localhost:8000/browser.html`.
- `05-fround.test.js`: `fc.float()` без `noNaN` генерує й `NaN`, а `NaN === NaN` це `false`.
  Тест з `noNaN: true` проходить завжди. Входи fast-check випадкові, тож контрприклади можуть трохи відрізнятись від тих, що в таблиці.
- `vitest` не приймає довільних прапорців на кшталт `--fix`, тому зламаний варіант вмикає вбудований `--mode broken` (у тесті це `import.meta.env.MODE`).
