# Lab 08: практика

Експерименти до [Lab 08](../../lab-08-ship-it.md) і його [нотаток](../../lab-08-ship-it.notes.md).
Кожен файл запускається окремо й показує одну ідею. Встановлювати нічого не треба
(Node 22+, без залежностей). `package-lock.json` тут лише для `npm ci` у `Dockerfile`.

**Docker необов'язковий.** Без нього працює все, крім §2 (кеш шарів) і порівняння `CMD` у §1.
Сам сигнал (`SIGTERM` проти `SIGKILL`) показує `01-sigterm.js` без Docker.
Для показу без інтернету заздалегідь стягни базовий образ: `docker pull node:22-alpine`.

## Порядок показу

| Файл | Запуск | Розділ нотаток | Що показує |
|---|---|---|---|
| `01-sigterm.js` | `node 01-sigterm.js` | §1 | `SIGTERM`: exit 0 за кілька мс, клієнт отримує `bye`; `SIGKILL`: `signal SIGKILL`, клієнт обривається на `tick` |
| `server.js` | `node server.js`, потім `kill -TERM <pid>` | §1 | те саме руками; сервер друкує `pid` при старті |
| `Dockerfile`, `Dockerfile.shell-cmd` | див. «Docker: сигнал» нижче | §1 | exec-форма `CMD` проти shell-форми з pipe: 0.2 с і код 0 проти таймауту і коду 137 |
| `Dockerfile`, `Dockerfile.copy-first` | див. «Docker: кеш шарів» нижче | §2 | після зміни `server.js` шар `npm ci` `CACHED` проти виконаного знову |
| `03-origin.js` | `node 03-origin.js` | §4 | сервер друкує `Origin`: свій — 101, чужий — 403, без `Origin` — 403, підроблений — 101 |
| `browser.html` | `node 03-origin.js --serve`, відкрити `http://localhost:3008` і `http://localhost:3009` | §3, §4 | зі свого origin `open` і `close 1000`; з чужого `error` і `close 1006` |
| `05-health.js` | `node 05-health.js` | §5 | `/health` не відповідає, поки цикл на головному потоці або процес під `kill -STOP`; з циклом у worker відповідає |

`05-health.js` сам запускає `05-health-server.js`; окремо сервер можна підняти `node 05-health-server.js` і смикати `curl -m 1 localhost:3008/health`.

## Docker: сигнал (§1)

```bash
docker build -t lab08 .
docker run -d --rm --name lab08 -p 3008:3008 lab08
curl -sN localhost:3008/stream &      # клієнт: hello, tick, tick, ...
time docker stop lab08
```

Очікування з `Dockerfile` (`CMD ["node", "server.js"]`): `docker stop` ~0.2 с, клієнт друкує `bye: server shutting down`,
`docker logs` показав би `[server] SIGTERM ...` і `exit 0` (з `--rm` логів після зупинки вже немає; приберіть `--rm`, щоб подивитись `docker logs lab08` і `docker inspect -f '{{.State.ExitCode}}' lab08`).

Потім те саме з `-f Dockerfile.shell-cmd -t lab08-shell` (`CMD node server.js | tee /tmp/server.log`).
Очікування: PID 1 — `/bin/sh -c ...` (`docker exec lab08 ps`), `docker stop` чекає таймаут і вбиває (`SIGKILL`), код виходу 137,
`SIGTERM` у логах немає, клієнт обривається на `tick`.

Що вийшло на Docker Desktop 29.8.2, `node:22-alpine`:

| `CMD` | PID 1 | `docker stop` | Код | Клієнт |
|---|---|---|---|---|
| `["node", "server.js"]` | `node server.js` | 0.24 с | 0 | `bye` |
| `node server.js` (shell-форма) | `node server.js` | 0.15 с | 0 | `bye` |
| `echo ... && node server.js` | `node server.js` | 0.21 с | 0 | `bye` |
| `["npm", "start"]` і `npm start` | `npm start`, node дочірній | 0.16–0.18 с | 0 | `bye` |
| `node server.js \| tee /tmp/server.log` | `/bin/sh -c ...` | 3.2 с (з `-t 10`: 10.1 с) | 137 | обрив |

## Docker: кеш шарів (§2)

```bash
docker build -t lab08 .
docker build -f Dockerfile.copy-first -t lab08-copy-first .
# зміни будь-який рядок у server.js, потім знову обидві команди з --progress=plain
docker build --progress=plain -t lab08 .
docker build --progress=plain -f Dockerfile.copy-first -t lab08-copy-first .
```

Очікування після зміни `server.js`:

```text
# Dockerfile
#8 [4/5] RUN npm ci --omit=dev && echo "npm ci виконано"
#8 CACHED
#9 [5/5] COPY . .

# Dockerfile.copy-first
#7 [3/4] COPY . .
#8 [4/4] RUN npm ci --omit=dev && echo "npm ci виконано"
#8 0.506 npm ci виконано
```

Не забудь повернути `server.js`.

## Примітки для показу

- Перед кожною частиною проси прогноз уголос, потім запускай. Частини розділені заголовками `--- A`, `--- B`.
- `01`: дедлайн 2 с у `server.js` спрацьовує, коли з'єднання не idle (клієнт почав запит і не дописав його): `не встиг за 2 с, exit 1`. Перевірено руками.
- §1, Docker: `CMD npm start` сигнал доносить, npm пересилає `SIGTERM` дочірньому node (таблиця вище).
  І голе `CMD node server.js` у shell-формі теж працює: `sh -c` з однією командою (і з `... && node server.js`) робить `exec`, і node стає PID 1.
  Проблему видно, лише коли після node у рядку ще щось є, наприклад pipe у `tee`. Тому `Dockerfile.shell-cmd` саме такий.
- §1, Docker: типовий таймаут `docker stop` — ~10 с. На Docker Desktop 29.8.2 без `-t` вийшло ~3 с, з `docker stop -t 10` — 10 с. Звідки 3 с, не з'ясовували.
- §2: розмір образів однаковий (165 MB): залежностей немає, порядок шарів впливає на кеш і час збірки, не на розмір.
  `npm ci` без залежностей іде пів секунди, тож дивись на рядок `CACHED`, а не на секундомір.
- §3, mixed content: зі сторінки `https://` рядок `new WebSocket('ws://example.com/')` одразу кидає `SecurityError: ... An insecure WebSocket connection may not be initiated from a page loaded over HTTPS`
  (перевірено в Chrome 156 на `https://example.com`). Без інтернету https-сторінки під рукою немає, тож це покажеш лише з мережею.
  Локально `http://localhost` + `ws://` працює (`browser.html`), як і кажуть нотатки.
- §4, origin: «чужий сайт» тут — та сама сторінка з порту 3009: інший порт — інший origin. З публічного https-сайту до `ws://localhost`
  Chrome 156 нас не пустив зовсім: сервер рукостискання не побачив, на сторінці ні `error`, ні `close`.
  Сервер відповідає 403, а браузер показує лише `error` і `close 1006`, причину не каже. Дивись у термінал сервера.
- §4: `http://localhost:3008` і `http://127.0.0.1:3008` — різні origin. У `--serve` дозволено обидва; добре питання студентам, що буде, якщо лишити один.
- §4, частина D: `Origin` захищає користувачів від чужих сторінок у їхньому браузері. Будь-який не браузер (curl, бот) напише собі будь-який `Origin`.
- `05`: частини A і C дають однакову картину: два таймаути по 1 с, потім відповіді, і `elu` близько 1 у першій відповіді після паузи.
  У B цикл крутиться в worker, `/health` відповідає щоразу, `elu` близько 0. Іде ~15 с.
