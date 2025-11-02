import * as storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('flashcards-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // Get references to DOM elements
    const progressCounter = document.getElementById('progress-counter');
    const cardFlipper = document.getElementById('card-flipper');
    const cardFront = document.getElementById('flashcard-front');
    const cardBack = document.getElementById('flashcard-back');
    const btnUnknown = document.getElementById('btn-unknown');
    const btnKnown = document.getElementById('btn-known');
    const btnFinish = document.getElementById('btn-finish');

    // State variables for the practice session
    let currentCards = [];
    let currentIndex = 0;
    let knownCardsIds = [];
    let unknownCardsIds = [];

    // Get set ID and practice type from URL parameters
    const params = new URLSearchParams(window.location.search);
    const setId = parseInt(params.get('setId'));
    const practiceType = params.get('type');

    // Shuffles an array in place (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Gets the cards for the current session based on the practice type
    function getCardsForSession(set) {
        // If practicing difficult cards, filter for unknown cards from the last session
        if (practiceType === 'difficult') {
            const sessionData = JSON.parse(sessionStorage.getItem('lastSession'));
            if (sessionData?.unknown?.length > 0) {
                const difficultCardIds = new Set(sessionData.unknown);
                return set.cards.filter(card => difficultCardIds.has(card.id));
            }
            return []; // No difficult cards to practice
        }
        // Otherwise, return all cards from the set
        return [...set.cards];
    }

    // Loads the cards for the selected set
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

    // Starts the practice session
    function startPractice() {
        currentIndex = 0;
        knownCardsIds = [];
        unknownCardsIds = [];
        showCard();
    }

    // Displays the current card
    function showCard() {
        if (currentIndex >= currentCards.length) {
            endSession();
            return;
        }

        const card = currentCards[currentIndex];
        cardFlipper.classList.remove('is-flipped');

        // Update card content after flip animation
        setTimeout(() => {
            cardFront.textContent = card.front;
            cardBack.textContent = card.back;
        }, 200);

        progressCounter.textContent = `${currentIndex + 1}/${currentCards.length}`;
    }

    // Moves to the next card and records whether it was known or unknown
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

    // Ends the practice session and saves the results
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

    // --- Event Listeners ---
    cardFlipper.addEventListener('click', () => cardFlipper.classList.toggle('is-flipped'));
    btnKnown.addEventListener('click', () => nextCard(true));
    btnUnknown.addEventListener('click', () => nextCard(false));
    btnFinish.addEventListener('click', endSession);
    
    loadCards();
});