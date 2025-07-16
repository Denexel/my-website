# Используем базовый образ Node.js
FROM node:18-alpine

# Устанавливаем зависимости для сборки mysql2
RUN apk add --no-cache python3 make g++

# Устанавливаем PM2 глобально
RUN npm install -g pm2

# Создаем рабочие директории
RUN mkdir -p /app /usr/share/nginx/html

# Устанавливаем nginx
RUN apk add --no-cache nginx

# Копируем файлы сервера
WORKDIR /app
COPY app/package*.json ./
RUN npm install --production
COPY app/server.js ./
COPY app/booking.js ./

# Копируем статические файлы фронтенда
COPY index.html admin.html /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порты
EXPOSE 80 3000

# Запускаем сервисы
CMD (nginx -g "daemon off;" &) && pm2-runtime /app/server.js