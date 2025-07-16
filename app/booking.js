async function updateTableStates() {
    try {
        const reservations = await fetchAPI('/reservations');
        const tableCards = document.querySelectorAll('.table-card');
        
        tableCards.forEach(card => {
            const tableId = card.getAttribute('data-table');
            const btn = card.querySelector('.reserve-btn');
            const label = card.querySelector('.reserved-label');
            const dateTimeSpan = card.querySelector('.reserved-date-time');
            
            const reservation = reservations.find(r => r.table_id == tableId);
            
            if (reservation) {
                btn.disabled = true;
                btn.textContent = 'Забронирован';
                card.querySelector('.reserve-date').style.display = 'none';
                card.querySelector('.reserve-time').style.display = 'none';
                label.style.display = 'block';
                dateTimeSpan.textContent = `${reservation.date} в ${reservation.time}`;
            } else {
                btn.disabled = false;
                btn.textContent = 'Забронировать';
                card.querySelector('.reserve-date').style.display = 'block';
                card.querySelector('.reserve-time').style.display = 'block';
                label.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Failed to update tables:', error);
        alert('Ошибка при загрузке данных. Пожалуйста, обновите страницу.');
    }
}

async function handleReservation(tableId, date, time) {
    try {
        const result = await fetchAPI('/reservations', 'POST', {
            tableId, 
            date, 
            time
        });
        
        if (result.error) throw new Error(result.error);
        return true;
    } catch (error) {
        console.error('Reservation failed:', error);
        alert('Ошибка при бронировании: ' + error.message);
        return false;
    }
    // Обновляем состояние каждые 5 секунд
setInterval(updateTableStates, 5000);

// И при загрузке страницы
document.addEventListener('DOMContentLoaded', updateTableStates);
}