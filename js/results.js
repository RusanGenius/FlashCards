document.addEventListener('DOMContentLoaded', () => {
    // Retrieve and apply the saved theme from local storage
    const savedTheme = localStorage.getItem('flashcards-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // Get references to DOM elements
    const summaryText = document.getElementById('results-summary');
    const btnRepeatDifficult = document.getElementById('btn-repeat-difficult');
    const btnRestart = document.getElementById('btn-restart');
    const btnHome = document.getElementById('btn-home');
    const progressKnown = document.getElementById('progress-known');
    const progressUnknown = document.getElementById('progress-unknown');

    // Retrieve session data from session storage
    const sessionData = JSON.parse(sessionStorage.getItem('lastSession'));

    // Display a message if no session data is found
    if (!sessionData) {
        summaryText.textContent = "Не найдено данных о последней сессии.";
        return;
    }

    // Destructure session data
    const { setId, known, unknown, total } = sessionData;
    // Create and display a summary message
    let summaryMessage = `Выучено: ${known.length} из ${total}.`;
    if (unknown.length > 0) {
        summaryMessage += ` Повторить: ${unknown.length}.`;
    }
    summaryText.textContent = summaryMessage;

    // Update progress bars if there are cards in the set
    if (total > 0) {
        const knownPercent = (known.length / total) * 100;
        const unknownPercent = (unknown.length / total) * 100;

        // Animate progress bars shortly after page load
        setTimeout(() => {
            progressKnown.style.width = `${knownPercent}%`;
            progressUnknown.style.width = `${unknownPercent}%`;
        }, 100);
    }

    // Show and configure the "Repeat Difficult" button if there are unknown cards
    if (unknown.length > 0) {
        btnRepeatDifficult.style.display = 'block';
        btnRepeatDifficult.addEventListener('click', () => {
            window.location.href = `practice.html?setId=${setId}&type=difficult`;
        });
    }

    // Configure the "Restart" button
    btnRestart.addEventListener('click', () => {
        window.location.href = `practice.html?setId=${setId}`;
    });

    // Configure the "Home" button
    btnHome.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});