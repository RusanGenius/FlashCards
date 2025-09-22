import * as storage from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const setsGrid = document.getElementById('sets-grid');
    const createSetBtn = document.getElementById('create-set-btn');

    // Модальное окно создания
    const createSetModal = document.getElementById('create-set-modal');
    const createSetForm = document.getElementById('create-set-form');
    const newSetNameInput = document.getElementById('new-set-name');
    const closeCreateModalBtn = document.querySelector('#create-set-modal .modal-close-btn');

    // Модальное окно редактирования
    const editSetModal = document.getElementById('edit-set-modal');
    const editSetNameInput = document.getElementById('edit-set-name-input');
    const addCardForm = document.getElementById('add-card-form');
    const cardFrontInput = document.getElementById('card-front');
    const cardBackInput = document.getElementById('card-back');
    const saveCardBtn = document.getElementById('save-card-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const cardList = document.getElementById('card-list');
    const closeEditModalBtn = document.querySelector('#edit-set-modal .modal-close-btn');

    let currentEditingSetId = null;
    let currentEditingCardId = null;

    // --- Иконки ---
    const editIconSVG = `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`;
    const practiceIconSVG = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`;
    // ИЗМЕНЕНИЕ 2: Добавлена иконка удаления
    const deleteIconSVG = `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;


    // --- Функции рендеринга и UI ---

    function renderSets() {
        const sets = storage.getSets();
        const existingTiles = setsGrid.querySelectorAll('.set-tile:not(.create-new-tile)');
        existingTiles.forEach(tile => tile.remove());

        sets.forEach(set => {
            const tile = document.createElement('div');
            tile.className = 'set-tile glass-effect';
            tile.dataset.setId = set.id;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'set-tile-name';
            nameSpan.textContent = set.name;
            
            // ИЗМЕНЕНИЕ 2: Старая кнопка удаления удалена
            // const deleteBtn = ...

            const actionsPanel = document.createElement('div');
            actionsPanel.className = 'set-tile-actions';
            // ИЗМЕНЕНИЕ 2: Добавлена иконка удаления в панель действий
            actionsPanel.innerHTML = `
                <div class="action-icon edit-btn" title="Редактировать">${editIconSVG}</div>
                <div class="action-icon practice-btn" title="Практика">${practiceIconSVG}</div>
                <div class="action-icon delete-btn" title="Удалить">${deleteIconSVG}</div>
            `;

            tile.append(nameSpan, actionsPanel);
            setsGrid.appendChild(tile);

            tile.addEventListener('click', (e) => {
                if (e.target.closest('.action-icon')) return;
                document.querySelectorAll('.set-tile.actions-visible').forEach(t => {
                    if (t !== tile) t.classList.remove('actions-visible');
                });
                tile.classList.toggle('actions-visible');
            });

            tile.querySelector('.edit-btn').addEventListener('click', () => openEditModal(set.id));
            tile.querySelector('.practice-btn').addEventListener('click', () => {
                window.location.href = `practice.html?setId=${set.id}`;
            });
            // ИЗМЕНЕНИЕ 2: Добавлен обработчик для новой кнопки удаления
            tile.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm(`Вы уверены, что хотите удалить набор "${set.name}"?`)) {
                    storage.deleteSet(set.id);
                    renderSets();
                }
            });
        });
    }

    function openEditModal(setId) {
        currentEditingSetId = setId;
        const set = storage.getSetById(setId);
        if (!set) return;

        editSetNameInput.value = set.name;
        resetCardForm();
        renderCardList(set.id, set.cards);
        editSetModal.style.display = 'flex';
        autoResizeTextareas(); 
    }

    function renderCardList(setId, cards) {
        cardList.innerHTML = '';
        cards.forEach(card => {
            const li = document.createElement('li');
            li.className = 'card-list-item';
            li.dataset.cardId = card.id;

            li.innerHTML = `
                <span>${card.front}</span>
                <span>${card.back}</span>
                <button class="delete-card-btn" data-card-id="${card.id}">&times;</button>
            `;
            
            li.querySelector('.delete-card-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                storage.deleteCardFromSet(setId, card.id);
                renderCardList(setId, storage.getSetById(setId).cards);
            });

            li.addEventListener('click', () => {
                currentEditingCardId = card.id;
                cardFrontInput.value = card.front;
                cardBackInput.value = card.back;
                saveCardBtn.textContent = 'Обновить карточку';
                clearFormBtn.style.display = 'inline-block';
                autoResizeTextareas();
            });

            cardList.appendChild(li);
        });
    }

    function resetCardForm() {
        currentEditingCardId = null;
        addCardForm.reset();
        saveCardBtn.textContent = 'Сохранить карточку';
        clearFormBtn.style.display = 'none';
        autoResizeTextareas();
        cardFrontInput.focus();
    }

    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    function autoResizeTextareas() {
        autoResizeTextarea(cardFrontInput);
        autoResizeTextarea(cardBackInput);
    }

    // --- Обработчики событий ---

    createSetBtn.addEventListener('click', () => {
        createSetModal.style.display = 'flex';
        newSetNameInput.focus();
    });

    createSetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newSetNameInput.value.trim();
        if (name) {
            storage.addSet(name);
            newSetNameInput.value = '';
            createSetModal.style.display = 'none';
            renderSets();
        }
    });

    editSetNameInput.addEventListener('blur', () => {
        const newName = editSetNameInput.value.trim();
        if (newName && currentEditingSetId) {
            storage.updateSetName(currentEditingSetId, newName);
            renderSets();
        }
    });
    
    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const front = cardFrontInput.value.trim();
        const back = cardBackInput.value.trim();

        if (!front || !back || !currentEditingSetId) return;
        
        const cardData = { front, back };

        if (currentEditingCardId) {
            storage.updateCardInSet(currentEditingSetId, currentEditingCardId, cardData);
        } else {
            storage.addCardToSet(currentEditingSetId, cardData);
        }
        
        renderCardList(currentEditingSetId, storage.getSetById(currentEditingSetId).cards);
        resetCardForm();
    });

    clearFormBtn.addEventListener('click', resetCardForm);

    [cardFrontInput, cardBackInput].forEach(textarea => {
        textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    });

    // --- Закрытие модальных окон ---
    function closeModal() {
        createSetModal.style.display = 'none';
        editSetModal.style.display = 'none';
    }

    closeCreateModalBtn.addEventListener('click', closeModal);
    closeEditModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === createSetModal || e.target === editSetModal) {
            closeModal();
        }
    });

    // --- Инициализация ---
    renderSets();
});