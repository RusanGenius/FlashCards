document.addEventListener('DOMContentLoaded', () => {
    const summaryText = document.getElementById('results-summary');
    const btnRepeatDifficult = document.getElementById('btn-repeat-difficult');
    const btnRestart = document.getElementById('btn-restart');
    const btnHome = document.getElementById('btn-home');
    // ИЗМЕНЕНИЕ 6: Получаем элементы прогресс-бара
    const progressKnown = document.getElementById('progress-known');
    const progressUnknown = document.getElementById('progress-unknown');

    const sessionData = JSON.parse(sessionStorage.getItem('lastSession'));

    if (!sessionData) {
        summaryText.textContent = "Не найдено данных о последней сессии.";
        return;
    }

    const { setId, known, unknown, total } = sessionData;
    summaryText.textContent = `Выучено: ${known.length} из ${total}. Повторить: ${unknown.length}.`;

    // ИЗМЕНЕНИЕ 6: Логика для прогресс-бара
    if (total > 0) {
        const knownPercent = (known.length / total) * 100;
        const unknownPercent = (unknown.length / total) * 100;

        // Запускаем анимацию с небольшой задержкой, чтобы CSS transition сработал
        setTimeout(() => {
            progressKnown.style.width = `${knownPercent}%`;
            progressUnknown.style.width = `${unknownPercent}%`;
        }, 100);
    }


    if (unknown.length > 0) {
        btnRepeatDifficult.style.display = 'block';
        btnRepeatDifficult.addEventListener('click', () => {
            window.location.href = `practice.html?setId=${setId}&type=difficult`;
        });
    }

    btnRestart.addEventListener('click', () => {
        window.location.href = `practice.html?setId=${setId}`;
    });

    btnHome.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});