const STORAGE_KEY = 'flashcards_app_data';

// --- ИЗМЕНЕНИЕ: Функция для создания наборов по умолчанию ---
function _createDefaultData() {
    const now = Date.now();
    return {
        sets: [
            {
                id: now,
                name: "Ключевые даты в истории России",
                cards: [
                    { id: now + 1, front: '862 год', back: 'Призвание варягов на Русь' },
                    { id: now + 2, front: '988 год', back: 'Крещение Руси' },
                    { id: now + 3, front: '1242 год', back: 'Ледовое побоище' },
                    { id: now + 4, front: '1480 год', back: 'Стояние на реке Угре, конец ордынского ига' },
                    { id: now + 5, front: '1613 год', back: 'Начало правления династии Романовых' },
                    { id: now + 6, front: '1703 год', back: 'Основание Санкт-Петербурга' },
                    { id: now + 7, front: '1812 год', back: 'Бородинское сражение' },
                    { id: now + 8, front: '1861 год', back: 'Отмена крепостного права' },
                    { id: now + 9, front: '1917 год', back: 'Октябрьская революция' },
                    { id: now + 10, front: '1945 год', back: 'Окончание Великой Отечественной войны' }
                ]
            },
            {
                id: now + 11,
                name: "Английские слова",
                cards: [
                    { id: now + 12, front: 'Cat', back: 'Кошка' },
                    { id: now + 13, front: 'Big pencil', back: 'Большой карандаш' },
                    { id: now + 14, front: 'Experience', back: 'Опыт' },
                    { id: now + 15, front: 'Inevitable', back: 'Неизбежный' },
                    { id: now + 16, front: 'Curious', back: 'Любопытный' },
                    { id: now + 17, front: 'Admire', back: 'Восхищаться' },
                    { id: now + 18, front: 'To distinguish', back: 'Различать, отличать' },
                    { id: now + 19, front: 'To comprehend', back: 'Понимать, постигать' },
                    { id: now + 20, front: 'To persuade', back: 'Убеждать' },
                    { id: now + 21, front: 'To acknowledge', back: 'Признавать, подтверждать' },
                    { id: now + 22, front: 'Abundant', back: 'Обильный, избыточный' },
                    { id: now + 23, front: 'To anticipate', back: 'Предвидеть, ожидать' },
                    { id: now + 24, front: 'Admit', back: 'Признавать' },
                    { id: now + 25, front: 'Subtle', back: 'Тонкий, неуловимый, нежный' },
                    { id: now + 26, front: 'Diligent', back: 'Старательный, прилежный' }
                ]
            }
        ]
    };
}

// --- ИЗМЕНЕНИЕ: Основная функция получения данных теперь создает контент для новых пользователей ---
function _getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    // Если данных нет, создаем их по умолчанию и сохраняем
    if (!data) {
        const defaultData = _createDefaultData();
        _saveData(defaultData);
        return defaultData;
    }
    // Если данные есть, просто возвращаем их
    return JSON.parse(data);
}

function _saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSets() {
    return _getData().sets;
}

export function getSetById(setId) {
    return getSets().find(set => set.id === setId);
}

export function addSet(name) {
    const data = _getData();
    const newSet = {
        id: Date.now(),
        name: name,
        cards: []
    };
    data.sets.push(newSet);
    _saveData(data);
    return newSet;
}

export function deleteSet(setId) {
    let data = _getData();
    data.sets = data.sets.filter(set => set.id !== setId);
    _saveData(data);
}

export function updateSetName(setId, newName) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        set.name = newName;
        _saveData(data);
    }
}

export function addCardToSet(setId, cardData) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        const newCard = {
            id: Date.now(),
            front: cardData.front,
            back: cardData.back
        };
        set.cards.push(newCard);
        _saveData(data);
        return newCard;
    }
}

export function deleteCardFromSet(setId, cardId) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        set.cards = set.cards.filter(card => card.id !== cardId);
        _saveData(data);
    }
}

export function updateCardInSet(setId, cardId, newCardData) {
    const data = _getData();
    const set = data.sets.find(s => s.id === setId);
    if (set) {
        const cardIndex = set.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            set.cards[cardIndex].front = newCardData.front;
            set.cards[cardIndex].back = newCardData.back;
            _saveData(data);
        }
    }
}