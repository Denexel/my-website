// /api/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get } from 'firebase/database';

// Конфиг из Firebase Console
const firebaseConfig = {
  databaseURL: "https://sait-5f4cf-default-rtdb.firebaseio.com"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Экспортируем нужные методы
export { db, ref, push, get };
