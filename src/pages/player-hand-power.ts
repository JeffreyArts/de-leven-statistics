import "/src/scss/style.scss"
import "/src/scss/player-hand-power.scss"
import { Card, CardTypes } from "../models/card"
import { PlayerManagement } from "../models/player-management"

interface DeckCard {
    id: string;
    count: number;
}

interface Deck {
    name: string;
    cards: DeckCard[];
}

let decks: Deck[] = JSON.parse(localStorage.getItem("decks") || "[]")
if (decks.length === 0) {
    decks = [{
        name: "Default",
        cards: [
            { id: "card-dubbele-worp", count: 5 },
            { id: "card-best-of-3", count: 3 },
            { id: "card-extra-dobbelsteen", count: 6 },
            { id: "card-meerdere-dobbelstenen", count: 3 },
            { id: "card-wissel-positie", count: 2 },
            { id: "card-speler-links", count: 6 },
            { id: "card-speler-rechts", count: 6 },
            { id: "card-links,-rechts", count: 5 },
            { id: "card-iedereen", count: 4 },
            { id: "card-pak-een-kaart", count: 5 },
            { id: "card-achterwaarts", count: 6 }
        ]
    }]
    localStorage.setItem("decks", JSON.stringify(decks))
}
let currentDeckIndex: number = 0

// Initialiseer de mogelijke kaarten
const mogelijkeKaarten = CardTypes.map(cardType => new Card(cardType))

// Update de UI met de huidige deck status
const updateDeckUI = function() {
    // Update de tellers voor elke kaart
    mogelijkeKaarten.forEach(card => {
        const deckCard = decks[currentDeckIndex]?.cards.find(dc => dc.id === `card-${card.id}`)
        const countEl = card.tr?.querySelector(".card-count")
        if (countEl) {
            countEl.textContent = deckCard ? deckCard.count.toString() : "0"
        }
    })

    // Update het totaal aantal kaarten
    const totalCards = decks[currentDeckIndex]?.cards.reduce((sum, card) => sum + card.count, 0) || 0
    const totalCardsEl = document.querySelector("#simulaties")
    if (totalCardsEl) {
        totalCardsEl.textContent = totalCards.toString()
    }

    // Update de deck naam input
    const deckNameInput = document.querySelector("#deck-name") as HTMLInputElement
    if (deckNameInput && currentDeckIndex >= 0) {
        deckNameInput.value = decks[currentDeckIndex].name
    }
}

// Update de lijst met beschikbare decks
const updateDecksList = function() {
    const decksList = document.querySelector("#decks-list")
    if (!decksList) return

    decksList.innerHTML = ""
    decks.forEach((deck, index) => {
        const li = document.createElement("li")
        if (index === currentDeckIndex) {
            li.classList.add("active")
        }
        
        const nameSpan = document.createElement("span")
        nameSpan.textContent = deck.name
        
        const statusEl = document.createElement("div")
        if (index === currentDeckIndex) {
            statusEl.textContent = "actief"
            statusEl.className = "status-active"
        } else {
            const deleteButton = document.createElement("button")
            deleteButton.textContent = "×"
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation()
                deleteDeck(index)
            })
            statusEl.appendChild(deleteButton)
        }
        
        li.appendChild(nameSpan)
        li.appendChild(statusEl)
        li.addEventListener("click", () => selectDeck(index))
        decksList.appendChild(li)
    })
}

// Selecteer een deck
const selectDeck = function(index: number) {
    currentDeckIndex = index
    updateDeckUI()
    updateDecksList()

    // Update het deck in de PlayerManagement class
    const selectedDeck = decks[currentDeckIndex]
    const cards = selectedDeck.cards.flatMap(deckCard => {
        const cardType = CardTypes.find(ct => `card-${ct.toLowerCase().replace(/\s+/g, "-")}` === deckCard.id)
        if (!cardType) return []
        return Array(deckCard.count).fill(new Card(cardType))
    })
    playerManagement.setDeck(cards)
}

// Verwijder een deck
const deleteDeck = function(index: number) {
    if (confirm("Weet je zeker dat je dit deck wilt verwijderen?")) {
        decks.splice(index, 1)
        if (currentDeckIndex === index) {
            currentDeckIndex = -1
        } else if (currentDeckIndex > index) {
            currentDeckIndex--
        }

        // Als er geen decks meer zijn, maak een nieuwe default deck
        if (decks.length === 0) {
            decks = [{
                name: "Default",
                cards: []
            }]
            currentDeckIndex = 0
        }

        localStorage.setItem("decks", JSON.stringify(decks))
        updateDeckUI()
        updateDecksList()
    }
}

// Sla het huidige deck op
const saveDeck = function() {
    const deckNameInput = document.querySelector("#deck-name") as HTMLInputElement
    if (!deckNameInput || !deckNameInput.value.trim() || currentDeckIndex < 0) {
        return
    }

    const deckName = deckNameInput.value.trim()
    decks[currentDeckIndex].name = deckName
    localStorage.setItem("decks", JSON.stringify(decks))
    updateDecksList()
}

const selectCard = function(event: Event) {
    const buttonEl = event.target as HTMLButtonElement
    if (!buttonEl || currentDeckIndex < 0) {
        return
    }
    
    const targetRow = buttonEl.parentElement?.parentElement?.parentElement
    if (!targetRow) {
        return
    }
    
    const cardId = targetRow.id
    const card = mogelijkeKaarten.find(card => `card-${card.id}` === cardId)
    if (!card) return
    
    const deckCard = decks[currentDeckIndex].cards.find(dc => dc.id === `card-${card.id}`)
    
    if (buttonEl.classList.contains("minus-btn")) {
        // Verwijder een kaart uit het deck
        if (deckCard) {
            if (deckCard.count > 1) {
                deckCard.count--
            } else {
                decks[currentDeckIndex].cards = decks[currentDeckIndex].cards.filter(dc => dc.id !== `card-${card.id}`)
            }
        }
    } else {
        // Voeg een kaart toe aan het deck
        if (deckCard) {
            deckCard.count++
        } else {
            decks[currentDeckIndex].cards.push({ id: `card-${card.id}`, count: 1 })
        }
    }

    localStorage.setItem("decks", JSON.stringify(decks))
    updateDeckUI()
}

// Event listeners voor deck management
document.querySelector("#deck-name")?.addEventListener("input", saveDeck)

// add cards from hand to #table
const table = document.querySelector("#hand-overview tbody")
if (table) {
    mogelijkeKaarten.forEach(card => {
        const tr = document.createElement("tr")
        tr.id = `card-${card.id}`
        const tdName = document.createElement("td")
        const tdDescr = document.createElement("td")
        const tdCount = document.createElement("td")
        const tdButton = document.createElement("td")
        const buttonContainer = document.createElement("div")
        const plusButton = document.createElement("button")
        const minusButton = document.createElement("button")
        const countSpan = document.createElement("span")
    
        table.appendChild(tr)
        tr.appendChild(tdName)
        tr.appendChild(tdDescr)
        tr.appendChild(tdCount)
        tr.appendChild(tdButton)
        tdCount.appendChild(countSpan)
        tdButton.appendChild(buttonContainer)
        buttonContainer.appendChild(plusButton)
        buttonContainer.appendChild(minusButton)
    
        tdName.innerHTML = card.name
        tdDescr.innerHTML = card.description
        countSpan.className = "card-count"
        countSpan.textContent = "0"
    
        plusButton.innerHTML = "+"
        minusButton.innerHTML = "-"
        
        plusButton.className = "plus-btn"
        minusButton.className = "minus-btn"
        
        plusButton.addEventListener("click", selectCard)
        minusButton.addEventListener("click", selectCard)
        
        card.tr = tr
    })
}

// Initialiseer de PlayerManagement class
const playerManagement = new PlayerManagement()

// Selecteer het eerste deck en geef het door aan de PlayerManagement class
if (decks.length > 0) {
    const selectedDeck = decks[0]
    const cards = selectedDeck.cards.flatMap(deckCard => {
        const cardType = CardTypes.find(ct => `card-${ct.toLowerCase().replace(/\s+/g, "-")}` === deckCard.id)
        if (!cardType) return []
        return Array(deckCard.count).fill(new Card(cardType))
    })
    playerManagement.setDeck(cards)
}

// Initialiseer de UI
updateDeckUI()
updateDecksList()