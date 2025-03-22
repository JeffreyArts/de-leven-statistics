import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/deck-builder.scss"
import {Card, CardTypes} from "../models/card"
import { Deck, DeckSerialization } from "../models/deck"

const mogelijkeKaarten: Card[] = []
let decks: Deck[] = JSON.parse(localStorage.getItem("decks") || "[]").map((d: DeckSerialization) => Deck.fromSerialization(d))
if (decks.length === 0) {
    const defaultDeck = new Deck()
    defaultDeck.setName("Default")
    defaultDeck.setCards([
        ...Array(5).fill(new Card("Dubbele worp")),
        ...Array(3).fill(new Card("Best of 3")),
        ...Array(6).fill(new Card("Extra dobbelsteen")),
        ...Array(3).fill(new Card("Meerdere dobbelstenen")),
        ...Array(2).fill(new Card("Wissel positie")),
        ...Array(6).fill(new Card("Speler links")),
        ...Array(6).fill(new Card("Speler rechts")),
        ...Array(5).fill(new Card("Links, rechts")),
        ...Array(4).fill(new Card("Iedereen")),
        ...Array(5).fill(new Card("Pak een kaart")),
        ...Array(6).fill(new Card("Achterwaarts"))
    ])
    decks = [defaultDeck]
    localStorage.setItem("decks", JSON.stringify(decks.map(d => d.toSerialization())))
}
let currentDeckIndex: number = 0

// Initialiseer de hand met kaarten
for(let i = 0; i < CardTypes.length; i++) {
    mogelijkeKaarten.push(new Card(CardTypes[i]))
}

// Update de UI met de huidige deck status
const updateDeckUI = function() {
    // Update de tellers voor elke kaart
    mogelijkeKaarten.forEach((card: Card) => {
        const deckCard = decks[currentDeckIndex]?.getCards().find(dc => dc.name === card.name)
        const countEl = card.tr?.querySelector(".card-count")
        if (countEl) {
            countEl.textContent = deckCard ? decks[currentDeckIndex].getCards().filter(dc => dc.name === card.name).length.toString() : "0"
        }
    })

    // Update het totaal aantal kaarten
    const totalCards = decks[currentDeckIndex]?.getCards().length || 0
    const totalCardsEl = document.querySelector("#simulaties")
    if (totalCardsEl) {
        totalCardsEl.textContent = totalCards.toString()
    }

    // Update de deck naam input
    const deckNameInput = document.querySelector("#deck-name") as HTMLInputElement
    if (deckNameInput && currentDeckIndex >= 0) {
        deckNameInput.value = decks[currentDeckIndex].getName()
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
        nameSpan.textContent = deck.getName()
        
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
            const defaultDeck = new Deck()
            defaultDeck.setName("Default")
            defaultDeck.setCards([
                ...Array(5).fill(new Card("Dubbele worp")),
                ...Array(3).fill(new Card("Best of 3")),
                ...Array(6).fill(new Card("Extra dobbelsteen")),
                ...Array(3).fill(new Card("Meerdere dobbelstenen")),
                ...Array(2).fill(new Card("Wissel positie")),
                ...Array(6).fill(new Card("Speler links")),
                ...Array(6).fill(new Card("Speler rechts")),
                ...Array(5).fill(new Card("Links, rechts")),
                ...Array(4).fill(new Card("Iedereen")),
                ...Array(5).fill(new Card("Pak een kaart")),
                ...Array(6).fill(new Card("Achterwaarts"))
            ])
            decks = [defaultDeck]
            currentDeckIndex = 0
        }

        localStorage.setItem("decks", JSON.stringify(decks.map(d => d.toSerialization())))
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
    decks[currentDeckIndex].setName(deckName)
    localStorage.setItem("decks", JSON.stringify(decks.map(d => d.toSerialization())))
    updateDecksList()
}

// Maak een nieuw deck
const newDeck = function() {
    const newDeckName = `Deck ${decks.length + 1}`
    const currentDeck = decks[currentDeckIndex]
    
    const newDeck = new Deck()
    newDeck.setName(newDeckName)
    newDeck.setCards([...currentDeck.getCards()])
    
    decks.push(newDeck)
    
    currentDeckIndex = decks.length - 1
    localStorage.setItem("decks", JSON.stringify(decks.map(d => d.toSerialization())))
    updateDeckUI()
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
    const card = mogelijkeKaarten.find((c: Card) => `card-${c.id}` === cardId)
    if (!card) return
    
    const deckCard = decks[currentDeckIndex].getCards().find(dc => dc.name === card.name)
    
    if (buttonEl.classList.contains("minus-btn")) {
        // Verwijder een kaart uit het deck
        if (deckCard) {
            if (decks[currentDeckIndex].getCards().filter(dc => dc.name === card.name).length > 1) {
                decks[currentDeckIndex].removeCard(deckCard)
            } else {
                decks[currentDeckIndex].removeCard(deckCard)
            }
        }
    } else {
        // Voeg een kaart toe aan het deck
        if (deckCard) {
            decks[currentDeckIndex].addCard(deckCard)
        } else {
            decks[currentDeckIndex].addCard(card)
        }
    }

    localStorage.setItem("decks", JSON.stringify(decks.map(d => d.toSerialization())))
    updateDeckUI()
}

// Event listeners voor deck management
document.querySelector("#deck-name")?.addEventListener("input", saveDeck)
document.querySelector("#new-deck")?.addEventListener("click", newDeck)

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
        
        plusButton.className = "addition-button"
        minusButton.className = "addition-button"
        
        plusButton.addEventListener("click", selectCard)
        minusButton.addEventListener("click", selectCard)
        
        card.tr = tr
    })
}

// Initialiseer de UI
updateDeckUI()
updateDecksList()

// Selecteer het eerste deck
if (decks.length > 0) {
    selectDeck(0)
} 