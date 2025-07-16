// /api/book.js
import { db, ref, push, get } from './firebase';

export default async function handler(req, res) {
  // Разрешаем запросы с любого домена (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  // Обработка бронирования
  if (req.method === 'POST') {
    const { tableId, date, time } = req.body;
    try {
      await push(ref(db, 'bookings'), { tableId, date, time });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка записи в БД' });
    }
  }

  // Отправка списка броней (для админки)
  if (req.method === 'GET') {
    try {
      const snapshot = await get(ref(db, 'bookings'));
      const bookings = [];
      snapshot.forEach((child) => {
        bookings.push(child.val());
      });
      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка чтения из БД' });
    }
  }
}
