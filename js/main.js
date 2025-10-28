import * as storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const body = document.body;
    const setsGrid = document.getElementById('sets-grid');

    const createSetBtn = document.getElementById('create-set-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const layoutToggleBtn = document.getElementById('layout-toggle-btn');

    // "Create Set" modal elements
    const createSetModal = document.getElementById('create-set-modal');
    const createSetForm = document.getElementById('create-set-form');
    const newSetNameInput = document.getElementById('new-set-name');
    const closeCreateModalBtn = document.querySelector('#create-set-modal .modal-close-btn');

    // "Edit Set" modal elements
    const editSetModal = document.getElementById('edit-set-modal');
    const editSetNameInput = document.getElementById('edit-set-name-input');
    const addCardForm = document.getElementById('add-card-form');
    const cardFrontInput = document.getElementById('card-front');
    const cardBackInput = document.getElementById('card-back');
    const saveCardBtn = document.getElementById('save-card-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const cardList = document.getElementById('card-list');
    const closeEditModalBtn = document.querySelector('#edit-set-modal .modal-close-btn');

    // State variables
    let currentEditingSetId = null;
    let currentEditingCardId = null;

    // SVG icons for action buttons
    const ICONS = {
        edit: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`,
        practice: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`,
        delete: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`
    };

    // Creates a DOM element for a set tile
    function createSetTileElement(set) {
        const tile = document.createElement('div');
        tile.className = 'set-tile glass-effect';
        tile.dataset.setId = set.id;
        tile.innerHTML = `
            <span class="set-tile-name">${set.name}</span>
            <div class="set-tile-actions">
                <div class="action-icon edit-btn" title="Редактировать">${ICONS.edit}</div>
                <div class="action-icon practice-btn" title="Практика">${ICONS.practice}</div>
                <div class="action-icon delete-btn" title="Удалить">${ICONS.delete}</div>
            </div>
        `;
        return tile;
    }

    // Renders all sets to the grid
    function renderSets() {
        const sets = storage.getSets();
        setsGrid.innerHTML = '';
        const setElements = sets.map(createSetTileElement);
        setsGrid.append(...setElements);
    }

    // Opens the "Edit Set" modal with the data for the selected set
    function openEditModal(setId) {
        const set = storage.getSetById(setId);
        if (!set) return;

        currentEditingSetId = setId;
        editSetNameInput.value = set.name;
        resetCardForm();
        renderCardList(set.id, set.cards);
        editSetModal.style.display = 'flex';
        autoResizeTextareas();
    }

    // Renders the list of cards for a given set
    function renderCardList(setId, cards) {
        cardList.innerHTML = '';
        cards.forEach(card => {
            const li = document.createElement('li');
            li.className = 'card-list-item';
            li.dataset.cardId = card.id;
            li.innerHTML = `
                <span>${card.front}</span>
                <span>${card.back}</span>
                <button class="delete-card-btn">&times;</button>
            `;
            cardList.appendChild(li);
        });
    }

    // Resets the card form to its initial state
    function resetCardForm() {
        currentEditingCardId = null;
        addCardForm.reset();
        saveCardBtn.textContent = 'Сохранить';
        clearFormBtn.style.display = 'none';
        autoResizeTextareas();
        cardFrontInput.focus();
    }

    // Automatically resizes a textarea to fit its content
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Resizes both textareas in the card form
    function autoResizeTextareas() {
        autoResizeTextarea(cardFrontInput);
        autoResizeTextarea(cardBackInput);
    }
    
    // Closes any open modals
    function closeModal() {
        createSetModal.style.display = 'none';
        editSetModal.style.display = 'none';
    }

    // Handles clicks within the sets grid (for actions like edit, practice, delete)
    function handleGridClick(e) {
        const tile = e.target.closest('.set-tile');
        if (!tile) return;

        const setId = parseInt(tile.dataset.setId);
        const actionBtn = e.target.closest('.action-icon');

        if (actionBtn) {
            if (actionBtn.classList.contains('edit-btn')) {
                openEditModal(setId);
            } else if (actionBtn.classList.contains('practice-btn')) {
                window.location.href = `practice.html?setId=${setId}`;
            } else if (actionBtn.classList.contains('delete-btn')) {
                const set = storage.getSetById(setId);
                if (confirm(`Вы уверены, что хотите удалить набор "${set.name}"?`)) {
                    storage.deleteSet(setId);
                    renderSets();
                }
            }
        } else {
            // Toggle action visibility on tile click
            document.querySelectorAll('.set-tile.actions-visible').forEach(t => {
                if (t !== tile) t.classList.remove('actions-visible');
            });
            tile.classList.toggle('actions-visible');
        }
    }

    // Handles clicks within the card list (for editing or deleting cards)
    function handleCardListClick(e) {
        const cardItem = e.target.closest('.card-list-item');
        if (!cardItem) return;

        const cardId = parseInt(cardItem.dataset.cardId);
        
        if (e.target.closest('.delete-card-btn')) {
            storage.deleteCardFromSet(currentEditingSetId, cardId);
            renderCardList(currentEditingSetId, storage.getSetById(currentEditingSetId).cards);
        } else {
            // Populate form with card data for editing
            const card = storage.getSetById(currentEditingSetId).cards.find(c => c.id === cardId);
            if (card) {
                currentEditingCardId = card.id;
                cardFrontInput.value = card.front;
                cardBackInput.value = card.back;
                saveCardBtn.textContent = 'Обновить карточку';
                clearFormBtn.style.display = 'inline-block';
                autoResizeTextareas();
            }
        }
    }

    // Initializes the application state on page load
    function initialize() {
        // Apply saved theme
        const savedTheme = localStorage.getItem('flashcards-theme');
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
        }

        // Apply saved layout
        const savedLayout = localStorage.getItem('flashcards-layout');
        if (savedLayout === 'list') {
            setsGrid.classList.add('list-view');
            layoutToggleBtn.classList.add('is-list-view');
        }

        renderSets();
    }

    // --- Event Listeners ---

    // Main controls
    createSetBtn.addEventListener('click', () => {
        createSetModal.style.display = 'flex';
        newSetNameInput.focus();
    });

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('flashcards-theme', currentTheme);
    });

    layoutToggleBtn.addEventListener('click', () => {
        setsGrid.classList.toggle('list-view');
        layoutToggleBtn.classList.toggle('is-list-view');
        const currentLayout = setsGrid.classList.contains('list-view') ? 'list' : 'grid';
        localStorage.setItem('flashcards-layout', currentLayout);
    });

    setsGrid.addEventListener('click', handleGridClick);

    // "Create Set" form submission
    createSetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newSetNameInput.value.trim();
        if (name) {
            storage.addSet(name);
            newSetNameInput.value = '';
            closeModal();
            renderSets();
        }
    });

    // "Edit Set" name input blur event
    editSetNameInput.addEventListener('blur', () => {
        const newName = editSetNameInput.value.trim();
        if (newName && currentEditingSetId) {
            storage.updateSetName(currentEditingSetId, newName);
            renderSets(); // Re-render to show the updated name
        }
    });
    
    // "Add/Update Card" form submission
    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const front = cardFrontInput.value.trim();
        const back = cardBackInput.value.trim();

        if (!front || !back || !currentEditingSetId) return;
        
        const cardData = { front, back };

        if (currentEditingCardId) {
            // Update existing card
            storage.updateCardInSet(currentEditingSetId, currentEditingCardId, cardData);
        } else {
            // Add new card
            storage.addCardToSet(currentEditingSetId, cardData);
        }
        
        renderCardList(currentEditingSetId, storage.getSetById(currentEditingSetId).cards);
        resetCardForm();
    });

    // Event listeners for card list, clear form button, and textareas
    cardList.addEventListener('click', handleCardListClick);
    clearFormBtn.addEventListener('click', resetCardForm);
    [cardFrontInput, cardBackInput].forEach(textarea => {
        textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    });

    // Event listeners for closing modals
    [closeCreateModalBtn, closeEditModalBtn].forEach(btn => btn.addEventListener('click', closeModal));
    window.addEventListener('click', (e) => {
        // Close modal if clicking outside of it
        if (e.target === createSetModal || e.target === editSetModal) {
            closeModal();
        }
    });

    // Initialize the app
    initialize();
});