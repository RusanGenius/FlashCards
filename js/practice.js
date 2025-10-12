import * as storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('flashcards-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

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
        return array;
    }

    function getCardsForSession(set) {
        if (practiceType === 'difficult') {
            const sessionData = JSON.parse(sessionStorage.getItem('lastSession'));
            if (sessionData?.unknown?.length > 0) {
                const difficultCardIds = new Set(sessionData.unknown);
                return set.cards.filter(card => difficultCardIds.has(card.id));
            }
            return [];
        }
        return [...set.cards];
    }

    function loadCards() {
        const set = storage.getSetById(setId);
        if (!set) {
            alert('Набор не найден!');
            window.location.href = 'index.html';
            return;
        }

        currentCards = getCardsForSession(set);

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

        setTimeout(() => {
            cardFront.textContent = card.front;
            cardBack.textContent = card.back;
        }, 200);

        progressCounter.textContent = `${currentIndex + 1}/${currentCards.length}`;
    }

    function nextCard(isKnown) {
        const cardId = currentCards[currentIndex].id;
        if (isKnown) {
            knownCardsIds.push(cardId);
        } else {
            unknownCardsIds.push(cardId);
        }
        currentIndex++;
        showCard();
    }

    function endSession() {
        const sessionData = {
            setId,
            known: knownCardsIds,
            unknown: unknownCardsIds,
            total: currentCards.length
        };
        sessionStorage.setItem('lastSession', JSON.stringify(sessionData));
        window.location.href = 'results.html';
    }

    cardFlipper.addEventListener('click', () => cardFlipper.classList.toggle('is-flipped'));
    btnFlip.addEventListener('click', () => cardFlipper.classList.toggle('is-flipped'));
    btnKnown.addEventListener('click', () => nextCard(true));
    btnUnknown.addEventListener('click', () => nextCard(false));
    btnFinish.addEventListener('click', endSession);
    
    loadCards();
});
