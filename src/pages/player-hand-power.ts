import "/src/scss/style.scss"
import "/src/scss/player-hand-power.scss"
import { PlayerManagement } from "./player-management"
import { Card, CardTypes } from "../models/card"

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

// Initialiseer de PlayerManagement class
const playerManagement = new PlayerManagement()

// Update de UI met de huidige deck status
const updateDeckUI = function() {
    // Update het totaal aantal kaarten
    const totalCards = decks[currentDeckIndex]?.cards.reduce((sum, card) => sum + card.count, 0) || 0
    const cardsInDeckEl = document.getElementById("cards-in-deck")
    if (cardsInDeckEl) {
        cardsInDeckEl.textContent = totalCards.toString()
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
    const currentDeck = decks[currentDeckIndex]
    const cards = currentDeck.cards.flatMap(deckCard => {
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

// Initialiseer de UI
updateDeckUI()
updateDecksList()

// Initialiseer het deck in de PlayerManagement class
if (decks.length > 0) {
    const currentDeck = decks[currentDeckIndex]
    const cards = currentDeck.cards.flatMap(deckCard => {
        const cardType = CardTypes.find(ct => `card-${ct.toLowerCase().replace(/\s+/g, "-")}` === deckCard.id)
        if (!cardType) return []
        return Array(deckCard.count).fill(new Card(cardType))
    })
    playerManagement.setDeck(cards)
}