const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// Основная асинхронная функция
async function main() {
  try {
    console.log('Запуск сервера...');
    
    // Подключаемся к базе данных
    const pool = await waitForDatabase();
    console.log('Успешно подключились к MySQL');
    
    // Инициализируем базу данных
    await initDB(pool);
    console.log('База данных инициализирована');

    // Создаем Express приложение
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Проверка здоровья сервера
    app.get('/api/bookings', async (req, res) => {
      try {
        const conn = await pool.getConnection();
        const [bookings] = await conn.query('SELECT * FROM bookings');
        conn.release();
        res.json(bookings);
      } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    });

    // API для бронирования
    app.post('/api/book', async (req, res) => {
      const { tableId, date, time } = req.body;
      console.log('Получена бронь:', { tableId, date, time }); 
      try {
        const conn = await pool.getConnection();
        
        // Проверяем, не забронирован ли уже столик
        const [existing] = await conn.query(
          'SELECT * FROM bookings WHERE table_id = ? AND booking_date = ? AND booking_time = ?',
          [tableId, date, time]
        );

        if (existing.length > 0) {
          conn.release();
          return res.status(400).json({ error: 'Столик уже забронирован!' });
        }

        // Сохраняем бронь
        await conn.query(
          'INSERT INTO bookings (table_id, booking_date, booking_time) VALUES (?, ?, ?)',
          [tableId, date, time]
        );
        conn.release();

        res.json({ success: true });
      } catch (err) {
        console.error('Ошибка бронирования:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    });

    // API для получения списка броней
    app.get('/api/bookings', async (req, res) => {
      try {
        const conn = await pool.getConnection();
        const [bookings] = await conn.query('SELECT * FROM bookings');
        conn.release();
        res.json(bookings);
      } catch (err) {
        console.error('Ошибка получения броней:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    });

    // API для отмены брони
    app.delete('/api/bookings/:id', async (req, res) => {
      try {
        const conn = await pool.getConnection();
        await conn.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        conn.release();
        res.json({ success: true });
      } catch (err) {
        console.error('Ошибка отмены брони:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    });

    // Запускаем сервер
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });

  } catch (err) {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  }
}

// Функция ожидания подключения к БД
async function waitForDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'reservations',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  let retries = 10; // Увеличили количество попыток
  while (retries) {
    try {
      console.log(`Попытка подключения к БД (осталось попыток: ${retries})`);
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log('Успешное подключение к MySQL');
      return pool;
    } catch (err) {
      retries--;
      console.error(`Ошибка подключения: ${err.message}`);
      if (retries === 0) {
        throw err;
      }
      await new Promise(res => setTimeout(res, 10000)); // Увеличили задержку до 10 сек
    }
  }
}

// Функция инициализации БД
async function initDB(pool) {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_id INT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица bookings создана или уже существует');
  } finally {
    conn.release();
  }
}

// Запускаем основную функцию
main().catch(err => {
  console.error('Фатальная ошибка:', err);
  process.exit(1);
});