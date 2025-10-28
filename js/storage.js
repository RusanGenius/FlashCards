// Key for storing app data in localStorage
const STORAGE_KEY = 'flashcards_app_data';

// Generates a unique ID based on the current timestamp
const _generateId = () => Date.now();

// Creates a default data structure with some sample sets and cards
function _createDefaultData() {
    return {
        sets: [
            {
                id: _generateId(),
                name: "Ключевые даты в истории России",
                cards: [
                    { id: _generateId() + 1, front: 'Крещение Руси', back: '988 год' },
                    { id: _generateId() + 2, front: 'Ледовое побоище', back: '1242 год' },
                    { id: _generateId() + 3, front: 'Стояние на реке Угре', back: '1480 год' },
                    { id: _generateId() + 4, front: 'Основание Санкт-Петербурга', back: '1703 год' },
                    { id: _generateId() + 5, front: 'Бородинское сражение', back: '1812 год' },
                    { id: _generateId() + 6, front: 'Отмена крепостного права', back: '1861 год' },
                    { id: _generateId() + 7, front: 'Октябрьская революция', back: '1917 год' },
                    { id: _generateId() + 8, front: 'Окончание ВОВ', back: '1945 год' }
                ]
            },
            {
                id: _generateId() + 10,
                name: "Английские слова",
                cards: [
                    { id: _generateId() + 11, front: 'Experience', back: 'Опыт' },
                    { id: _generateId() + 12, front: 'Inevitable', back: 'Неизбежный' },
                    { id: _generateId() + 13, front: 'Curious', back: 'Любопытный' },
                    { id: _generateId() + 14, front: 'To distinguish', back: 'Различать, отличать' },
                    { id: _generateId() + 15, front: 'To persuade', back: 'Убеждать' },
                    { id: _generateId() + 16, front: 'To acknowledge', back: 'Признавать, подтверждать' },
                    { id: _generateId() + 17, front: 'Subtle', back: 'Тонкий, неуловимый' },
                    { id: _generateId() + 18, front: 'Diligent', back: 'Старательный, прилежный' }
                ]
            }
        ]
    };
}

// Retrieves data from localStorage. If no data exists, it creates and saves default data.
function _getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        const defaultData = _createDefaultData();
        _saveData(defaultData);
        return defaultData;
    }
    return JSON.parse(data);
}

// Saves data to localStorage
function _saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Public API ---

// Returns all sets
export function getSets() {
    return _getData().sets;
}

// Returns a single set by its ID
export function getSetById(setId) {
    return getSets().find(set => set.id === setId);
}

// Adds a new, empty set
export function addSet(name) {
    const data = _getData();
    const newSet = {
        id: _generateId(),
        name: name,
        cards: []
    };
    data.sets.push(newSet);
    _saveData(data);
    return newSet;
}

// Deletes a set by its ID
export function deleteSet(setId) {
    let data = _getData();
    data.sets = data.sets.filter(set => set.id !== setId);
    _saveData(data);
}

// Updates the name of a set
export function updateSetName(setId, newName) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        set.name = newName;
        _saveData(data);
    }
}

// Adds a new card to a specific set
export function addCardToSet(setId, cardData) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        const newCard = {
            id: _generateId(),
            ...cardData
        };
        set.cards.push(newCard);
        _saveData(data);
        return newCard;
    }
}

// Deletes a card from a specific set
export function deleteCardFromSet(setId, cardId) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        set.cards = set.cards.filter(card => card.id !== cardId);
        _saveData(data);
    }
}

// Updates the data of a card in a specific set
export function updateCardInSet(setId, cardId, newCardData) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        const cardIndex = set.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            set.cards[cardIndex] = { ...set.cards[cardIndex], ...newCardData };
            _saveData(data);
        }
    }
}