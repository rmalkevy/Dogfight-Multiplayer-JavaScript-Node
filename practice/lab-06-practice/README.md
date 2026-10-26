# Lab 06: практика

Експерименти до [Lab 06](../../lab-06-typescript.md) і його [нотаток](../../lab-06-typescript.notes.md).
Кожен файл `.ts` показує одну помилку компілятора або її відсутність.

## Перший запуск

```bash
cd practice/lab-06-practice
npm install        # ставить typescript і tsx
```

Потрібен Node 22+ (перевірити: `node -v`). npm 11 може попередити, що не запустив
`postinstall` у `esbuild` (залежність `tsx`). Схвалювати не треба, `tsx` працює й так.

## Перевірка типів

```bash
npx tsc --noEmit
```

`tsconfig.json`: `strict`, `erasableSyntaxOnly` (лише те, що Node вміє просто зрізати). Очікування: **рівно п'ять помилок**, по одній у файлах 01–05, і жодної в 06:

| Файл | Компілюється? | Код | Де |
|---|---|---|---|
| `01-excess-property.ts` | ні | `TS2353` | літерал `{ x: 1, y: 2 }` у тип `{ x: number }`; рядок зі змінною `p` проходить |
| `02-map-get-strict.ts` | ні | `TS2322` | `const s: string = m.get(1)`: `string \| undefined`; три фікси нижче проходять |
| `03-exhaustive-union.ts` | ні | `TS2322` | `const _x: never = m`: варіант `chat` без `case` |
| `04-json-parse-unknown.ts` | ні | `TS18046` | `raw.type` на `unknown`; рядки з `any` проходять мовчки |
| `05-enum.ts` | ні | `TS1294` | `enum` під `erasableSyntaxOnly` |
| `06-as-const.ts` | так | — | `as const` + union замість `enum` |

Повний очікуваний вивід:

```text
01-excess-property.ts(12,34): error TS2353: Object literal may only specify known properties, and 'y' does not exist in type '{ x: number; }'.
02-map-get-strict.ts(7,7): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
03-exhaustive-union.ts(23,13): error TS2322: Type '{ type: "chat"; text: string; }' is not assignable to type 'never'.
04-json-parse-unknown.ts(17,42): error TS18046: 'raw' is of type 'unknown'.
05-enum.ts(7,6): error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

## Порядок показу

`tsx` запускає файл, не перевіряючи типів, тому файли з помилками теж запускаються. Це і є «типів на дроті немає».

| Файл | Запуск | Розділ нотаток | Що показує |
|---|---|---|---|
| `01-excess-property.ts` | `npx tsx 01-excess-property.ts` | §1 | у runtime `y` на місці в обох об'єктах |
| `02-map-get-strict.ts` | `npx tsx 02-map-get-strict.ts` | §2 | `a` має тип `string`, а в runtime `undefined`: `!` збрехав |
| `03-exhaustive-union.ts` | `npx tsx 03-exhaustive-union.ts` | §3 | `chat` мовчки провалюється в `default` |
| `04-json-parse-unknown.ts` | `npx tsx 04-json-parse-unknown.ts` | §4 | `any` компілюється і падає `TypeError`; перевірка на межі відхиляє повідомлення без `name` |
| `05-enum.ts` | `node 05-enum.ts`, потім `npx tsx 05-enum.ts` | §5 | `node` відмовляється: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`; `tsx` компілює `enum` сам |
| `06-as-const.ts` | `node 06-as-const.ts` | §5 | той самий код без `enum` іде в чистому `node`, без `tsx` |

## Примітки для показу

- Спершу `npx tsc --noEmit`, і нехай студенти до запуску вгадають, які файли не скомпілюються. Потім запускай файли з `tsx`.
- `01`: рядок з `r` (немає `z`) лишився закоментованим, як у нотатках. Розкоментуй, і з'явиться шоста помилка, `TS2741`.
- `03`: варіант `chat` уже додано в union. Додай `case 'chat'`, і помилка зникне; нова літера в протоколі ламає збірку, а не прод.
- `04`: у нотатках межу мережі перевіряє `zod`. Тут ручна перевірка `isJoin`, щоб не ставити ще одну залежність; ідея та сама.
- `05` і `06`: `node file.ts` без прапорців працює з Node 22.18+ (type stripping). Перевірено на Node 26.
  У нотатках «`enum` часто не підтримується»: у Node саме так, `enum` у strip-only режимі не працює ніколи.
- Номери рядків і колонок у помилках `tsc` зміняться, якщо редагувати файли.
- Версія: `typescript` 7.0.2 (нативний компілятор). Вивід вище знято саме з нього.
