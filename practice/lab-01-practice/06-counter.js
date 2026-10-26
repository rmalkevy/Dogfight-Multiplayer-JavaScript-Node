// Допоміжний модуль для 06-modules.js. Окремо не запускається.
console.log('  [06-counter.js] тіло модуля виконується');

const hidden = 'видно лише всередині цього файлу';
let count = 0;

export function bump() {
  count += 1;
  return count;
}

export const describe = () => `count = ${count}, hidden: ${hidden}`;
