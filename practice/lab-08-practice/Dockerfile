# Добре: exec-форма CMD і правильний порядок шарів.
#   docker build -t lab08 .
FROM node:22-alpine
WORKDIR /app
# Спершу лише маніфести: шар npm ci береться з кешу, поки вони не змінились
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && echo "npm ci виконано"
COPY . .
EXPOSE 3008
# Exec-форма: node — PID 1 і сам отримує SIGTERM від docker stop
CMD ["node", "server.js"]
