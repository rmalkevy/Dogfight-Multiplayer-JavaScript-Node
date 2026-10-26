// Експеримент 3 (§3, §4): Origin у WebSocket-рукостисканні, без пакета ws.
// Запуск:
//   node 03-origin.js           -> чотири підключення з терміналу, сервер друкує Origin кожного
//   node 03-origin.js --serve   -> для браузера: http://localhost:3008 (свій) і http://localhost:3009 (чужий)
//
// Сервер приймає WebSocket лише зі свого origin, решту відхиляє 403 ще до рукостискання.
// Це те, що робить verifyClient у ws, тільки руками.
// Спитай студентів ПЕРЕД запуском: яке з чотирьох підключень пройде?
import http from 'node:http';
import fs from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // константа з RFC 6455

function createServer(allowed) {
  const server = http.createServer((req, res) => {
    // Сторінка для --serve: та сама на обох портах
    const file = { '/': 'browser.html', '/browser.js': 'browser.js' }[req.url];
    if (!file) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(new URL(file, import.meta.url)));
  });

  server.on('upgrade', (req, socket) => {
    // Сокет з upgrade не має слухача error. Клієнт, якому відмовили, часто рве з'єднання,
    // і ECONNRESET без слухача повалив би весь сервер.
    socket.on('error', () => {});
    const origin = req.headers.origin;
    const ok = origin !== undefined && allowed.has(origin);
    console.log(`  [server] upgrade, Origin: ${origin ?? '(немає)'} -> ${ok ? 'прийнято' : '403'}`);
    if (!ok) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + GUID).digest('base64');
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
    );
    // Один текстовий кадр і кадр закриття 1000. Payload < 126 байтів, тому довжина в одному байті.
    const text = Buffer.from(`привіт, ${origin}`);
    socket.write(Buffer.concat([Buffer.from([0x81, text.length]), text]));
    socket.end(Buffer.from([0x88, 0x02, 0x03, 0xe8]));
  });
  return server;
}

// Клієнт для терміналу: http.request з Upgrade, щоб самим поставити (або не поставити) Origin.
function connect(port, origin) {
  const headers = {
    Connection: 'Upgrade',
    Upgrade: 'websocket',
    'Sec-WebSocket-Version': '13',
    'Sec-WebSocket-Key': randomBytes(16).toString('base64'),
  };
  if (origin) headers.Origin = origin;
  return new Promise((resolve) => {
    const req = http.request({ port, path: '/ws', headers });
    req.on('upgrade', (res, socket, head) => {
      // Перший кадр часто приходить разом із відповіддю 101 і лежить у head
      const read = (frame) => {
        resolve(`101, повідомлення: "${frame.subarray(2, 2 + frame[1]).toString()}"`);
        socket.destroy();
      };
      if (head.length > 0) read(head);
      else socket.once('data', read);
    });
    req.on('response', (res) => {
      resolve(`${res.statusCode}, з'єднання не відкрилось`);
      res.socket.destroy();
    });
    req.on('error', (e) => resolve(`помилка ${e.code}`));
    req.end();
  });
}

if (process.argv.includes('--serve')) {
  const allowed = new Set(['http://localhost:3008', 'http://127.0.0.1:3008']);
  createServer(allowed).listen(3008, () => console.log('свій:  http://localhost:3008'));
  createServer(allowed).listen(3009, () => console.log('чужий: http://localhost:3009  (та сама сторінка, інший origin)'));
} else {
  const allowed = new Set();
  const server = createServer(allowed);
  await new Promise((resolve) => server.listen(0, resolve)); // 0 = будь-який вільний порт
  const { port } = server.address();
  const own = `http://localhost:${port}`;
  allowed.add(own);

  // A: сторінка з нашого сайту. Очікування: прийнято, 101 і "привіт, http://localhost:<port>".
  console.log('--- A: свій origin');
  console.log('  [client]', await connect(port, own));

  // B: консоль чужого сайту. Очікування: 403.
  console.log('--- B: чужий origin');
  console.log('  [client]', await connect(port, 'https://evil.example'));

  // C: без Origin (curl, бот, нативний клієнт). Наша політика: відхиляти. Очікування: 403.
  console.log('--- C: без Origin');
  console.log('  [client]', await connect(port, null));

  // D: не браузер може написати будь-який Origin. Очікування: прийнято.
  // Origin захищає користувачів від чужих сторінок у їхньому браузері, а не сервер від ботів.
  console.log('--- D: підроблений Origin');
  console.log('  [client]', await connect(port, own));

  server.close();
}
