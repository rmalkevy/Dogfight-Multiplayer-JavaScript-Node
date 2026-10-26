// Браузерна частина Lab 05 (§5). Підключається з browser.html після sim.js.
const out = document.getElementById('out');
const { run, mulberry32 } = globalThis.sim;

function log(...args) {
  console.log(...args);
  out.textContent += args.join(' ') + '\n';
}
const show = (label, r) => log(`${label.padEnd(18)} x ${r.x}  y ${r.y}  hash ${r.hash}`);

document.getElementById('run').onclick = () => {
  log(`\n--- ${navigator.userAgent.match(/Chrome\/[\d.]+|Firefox\/[\d.]+|Version\/[\d.]+ Safari/)?.[0] ?? 'браузер'}`);
  show('без випадковості', run());
  show('Math.random()', run(1000, Math.random));
  show('seed 42', run(1000, mulberry32(42)));
};

document.getElementById('clear').onclick = () => { out.textContent = ''; };
