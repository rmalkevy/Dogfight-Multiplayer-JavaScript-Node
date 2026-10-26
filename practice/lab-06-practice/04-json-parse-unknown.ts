// Експеримент 4 (§4): JSON.parse повертає any. На межі мережі приймай unknown і звужуй.
// Перевірка: npx tsc --noEmit       Запуск: npx tsx 04-json-parse-unknown.ts
//
// Очікування від tsc: ОДНА помилка, TS18046 на raw.type ('raw' is of type 'unknown').
// Рядки з any компілюються без жодного слова, хоча падають у runtime.

// Частина A: any вимикає перевірку. tsc мовчить, runtime кидає TypeError.
const anyMsg = JSON.parse('{"type":"join"}');
try {
  console.log(anyMsg.player.name);
} catch (e) {
  console.log('A: any скомпілювався, а в runtime', (e as Error).name);
}

// Частина B: unknown змушує звузити, перш ніж читати поля.
const raw: unknown = JSON.parse('{"type":"join"}');
console.log('B: raw.type без перевірки', raw.type);

// Частина C: перевірка на межі. У нотатках це zod; тут ручна перевірка, щоб не тягнути залежність.
// Ідея та сама: runtime-перевірка + тип усередині.
type Join = { type: 'join'; name: string };
function isJoin(x: unknown): x is Join {
  return (
    typeof x === 'object' && x !== null &&
    (x as { type?: unknown }).type === 'join' &&
    typeof (x as { name?: unknown }).name === 'string'
  );
}
// Очікування: перше відхилено (немає name), друге прийнято.
for (const text of ['{"type":"join"}', '{"type":"join","name":"ana"}']) {
  const parsed: unknown = JSON.parse(text);
  if (isJoin(parsed)) console.log('C: прийнято, name =', parsed.name);
  else console.log('C: відхилено', text);
}
