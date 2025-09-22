import * as storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const progressCounter = document.getElementById('progress-counter');
    const cardFlipper = document.getElementById('card-flipper');
    const cardFront = document.getElementById('flashcard-front');
    const cardBack = document.getElementById('flashcard-back');
    const btnUnknown = document.getElementById('btn-unknown');
    const btnFlip = document.getElementById('btn-flip');
    const btnKnown = document.getElementById('btn-known');
    const btnFinish = document.getElementById('btn-finish');

    let currentCards = [];
    let currentIndex = 0;
    let knownCardsIds = [];
    let unknownCardsIds = [];

    const params = new URLSearchParams(window.location.search);
    const setId = parseInt(params.get('setId'));
    const practiceType = params.get('type');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadCards() {
        const set = storage.getSetById(setId);
        if (!set) {
            alert('Набор не найден!');
            window.location.href = 'index.html';
            return;
        }

        if (practiceType === 'difficult') {
            const sessionData = JSON.parse(sessionStorage.getItem('lastSession'));
            if (sessionData && sessionData.unknown) {
                const difficultCardIds = sessionData.unknown;
                currentCards = set.cards.filter(card => difficultCardIds.includes(card.id));
            } else {
                currentCards = []; // Нет сложных карточек для повторения
            }
        } else {
            currentCards = [...set.cards];
        }

        if (currentCards.length === 0) {
            alert("В этом наборе нет карточек для практики.");
            window.location.href = 'index.html';
            return;
        }
        
        shuffleArray(currentCards);
        startPractice();
    }

    function startPractice() {
        currentIndex = 0;
        knownCardsIds = [];
        unknownCardsIds = [];
        showCard();
    }

    function showCard() {
        if (currentIndex >= currentCards.length) {
            endSession();
            return;
        }

        const card = currentCards[currentIndex];
        cardFlipper.classList.remove('is-flipped');

        // Небольшая задержка для анимации переворота
        setTimeout(() => {
            cardFront.textContent = card.front;
            cardBack.textContent = card.back;
        }, 200);

        progressCounter.textContent = `${currentIndex + 1}/${currentCards.length}`;
    }

    function nextCard(isKnown) {
        const card = currentCards[currentIndex];
        if (isKnown) {
            knownCardsIds.push(card.id);
        } else {
            unknownCardsIds.push(card.id);
        }
        currentIndex++;
        showCard();
    }

    function endSession() {
        const sessionData = {
            setId: setId,
            known: knownCardsIds,
            unknown: unknownCardsIds,
            total: currentCards.length
        };
        sessionStorage.setItem('lastSession', JSON.stringify(sessionData));
        window.location.href = 'results.html';
    }

    // --- Обработчики событий ---
    cardFlipper.addEventListener('click', () => cardFlipper.classList.toggle('is-flipped'));
    btnFlip.addEventListener('click', () => cardFlipper.classList.toggle('is-flipped'));
    btnKnown.addEventListener('click', () => nextCard(true));
    btnUnknown.addEventListener('click', () => nextCard(false));
    btnFinish.addEventListener('click', endSession);
    
    // --- Инициализация ---
    loadCards();
});