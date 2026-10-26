// Помічник до 03-profile.js: топ функцій за self time з останнього профілю в profiles/.
// Запуск: node 03-top.js        (після node --cpu-prof --cpu-prof-dir=profiles 03-profile.js)
//
// Self time — час, коли функція сама була зверху стека, без тих, кого вона викликала.
// Те саме показує DevTools у вкладці Bottom-Up; тут — щоб не відкривати DevTools на парі.
import fs from 'node:fs';

const files = fs.existsSync('profiles') ? fs.readdirSync('profiles').filter((f) => f.endsWith('.cpuprofile')).sort() : [];
if (files.length === 0) {
  console.log('Немає профілю. Спершу: node --cpu-prof --cpu-prof-dir=profiles 03-profile.js');
  process.exit(1);
}
const file = files.at(-1);
const profile = JSON.parse(fs.readFileSync(`profiles/${file}`, 'utf8'));

const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
profile.samples.forEach((id, i) => {
  const name = nodes.get(id).callFrame.functionName || '(anonymous)';
  self.set(name, (self.get(name) ?? 0) + (profile.timeDeltas[i] ?? 0));
});
const total = [...self.values()].reduce((a, b) => a + b, 0);

console.log(`профіль: profiles/${file}`);
for (const [name, us] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
  console.log(`${name.padEnd(20)} ${((100 * us) / total).toFixed(1).padStart(5)} %`);
}
