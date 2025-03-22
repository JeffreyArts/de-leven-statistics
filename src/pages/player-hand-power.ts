import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/player-hand-power.scss"
import { PlayerManagementService } from "../services/player-management.service"
import { Deck, DeckSerialization } from "../models/deck"
import berekenScoreRange from "../utilities/bereken-score-range"

// Laad de beschikbare decks
const decks: Deck[] = JSON.parse(localStorage.getItem("decks") || "[]").map((d: DeckSerialization) => Deck.fromSerialization(d))
if (decks.length === 0) {
    alert("Geen decks gevonden, maak eerst een nieuw deck aan via de Deck builder pagina")
    throw new Error("Geen decks gevonden")
}

// Laad het actieve deck uit localStorage
const activeDeckName = localStorage.getItem("activeDeck")
let activeDeck: Deck = decks[0]
if (activeDeckName) {
    const savedDeck = decks.find(deck => deck.getName() === activeDeckName)
    if (savedDeck) {
        activeDeck = savedDeck
    }
}

// Initialiseer de PlayerManagement class met het eerste deck
const playerManagement = new PlayerManagementService()
// Stel eerst het deck in
playerManagement.setDeck(activeDeck.getCards())
// Laad dan de spelers en verwijder hun kaarten uit het deck
playerManagement.loadAndAdjustDeck()

// Initialiseer de UI elementen voor deck management
const decreaseButton = document.getElementById("decrease-players") as HTMLButtonElement
const increaseButton = document.getElementById("increase-players") as HTMLButtonElement
const dealButton = document.getElementById("deal-cards") as HTMLButtonElement
const resetButton = document.getElementById("reset-deck") as HTMLButtonElement
const playerCountInput = document.getElementById("player-count") as HTMLInputElement
const playerHandsList = document.getElementById("player-hands-list") as HTMLDivElement
const decksList = document.getElementById("decks-list") as HTMLUListElement

// Voeg de addition-button class toe aan de plus/min knoppen
if (decreaseButton) decreaseButton.classList.add("addition-button")
if (increaseButton) increaseButton.classList.add("addition-button")

// Initialiseer playerCount met de waarde uit de PlayerManagementService
let playerCount = playerManagement.getPlayerCount()
if (playerCountInput) {
    playerCountInput.value = playerCount.toString()
}

// Update de UI voor de knoppen
if (decreaseButton) decreaseButton.classList.toggle("addition-button__isDisabled", playerCount <= 2)
if (increaseButton) increaseButton.classList.toggle("addition-button__isDisabled", playerCount >= 8)

// Update de info boxes
const updateInfoBoxes = function(): void {
    const cardsInDeckEl = document.getElementById("cards-in-deck")
    const cardsInDiscardEl = document.getElementById("cards-in-discard")
    
    if (cardsInDeckEl) {
        cardsInDeckEl.textContent = playerManagement.getDeckSize().toString()
    }
    if (cardsInDiscardEl) {
        cardsInDiscardEl.textContent = playerManagement.getDiscardPileSize().toString()
    }
}

// Update de score voor een speler
const updatePlayerScore = function(playerNumber: number): void {
    const player = playerManagement.getPlayer(playerNumber)
    if (!player) return

    const selectedScoreElement = playerHandsList
        .querySelector(`.player-hand:nth-child(${playerNumber}) .selected-score`)
    const maxScoreElement = playerHandsList
        .querySelector(`.player-hand:nth-child(${playerNumber}) .max-score`)

    if (selectedScoreElement) {
        const [selectedMinScore, selectedMaxScore] = player.getSelectedScoreRange()
        if (selectedMaxScore == 0 && selectedMinScore == 0) {
            selectedScoreElement.textContent = "-"
        } else {
            selectedScoreElement.textContent = `[${selectedMinScore}, ${selectedMaxScore}]`
        }
    }

    if (maxScoreElement) {
        const [maxMinScore, maxMaxScore] = player.getScoreRange()
        maxScoreElement.textContent = `[${maxMinScore}, ${maxMaxScore}]`
    }
}

// Update de UI voor de spelers
const updatePlayerHandsDisplay = function(): void {
    playerHandsList.innerHTML = ""
    for (let i = 1; i <= playerCount; i++) {
        const playerHand = document.createElement("div")
        playerHand.className = "player-hand"
        
        const header = document.createElement("h4")
        const nameInput = document.createElement("input")
        nameInput.type = "text"
        nameInput.className = "player-name-input"
        nameInput.value = playerManagement.getPlayer(i)?.getName() || `Speler ${i}`
        nameInput.addEventListener("input", () => {
            playerManagement.updatePlayerName(i, nameInput.value)
        })
        header.appendChild(nameInput)

        const scoreContainer = document.createElement("div")
        scoreContainer.className = "score-container"
        
        const selectedScore = document.createElement("span")
        selectedScore.className = "score selected-score"
        selectedScore.textContent = "-"
        
        const maxScore = document.createElement("span")
        maxScore.className = "score max-score"
        maxScore.textContent = "-"
        
        scoreContainer.appendChild(selectedScore)
        scoreContainer.appendChild(maxScore)
        header.appendChild(scoreContainer)
        
        const cards = document.createElement("div")
        cards.className = "cards"
        
        const playButton = document.createElement("button")
        playButton.className = "play-hand-button"
        playButton.textContent = "Speel hand"
        playButton.addEventListener("click", () => playHand(i))
        
        playerHand.appendChild(header)
        playerHand.appendChild(cards)
        playerHand.appendChild(playButton)
        playerHandsList.appendChild(playerHand)

        // Als er een opgeslagen speler is, toon dan de kaarten
        const player = playerManagement.getPlayer(i)
        if (player) {
            player.getHand().forEach(card => {
                const cardElement = document.createElement("div")
                cardElement.className = "card"
                if (player.getSelectedCards().includes(card)) {
                    cardElement.classList.add("selected")
                }
                cardElement.textContent = card.name
                cardElement.addEventListener("click", () => {
                    cardElement.classList.toggle("selected")
                    if (cardElement.classList.contains("selected")) {
                        playerManagement.addPlayerSelectedCard(i, card)
                    } else {
                        playerManagement.removePlayerSelectedCard(i, card)
                    }
                    updatePlayerScore(i)
                })
                updatePlayerScore(i)
                cards.appendChild(cardElement)
            })
        }
    }
}

// Speel een hand voor een speler
const playHand = function(playerNumber: number): void {
    playerManagement.playHand(playerNumber)
    updatePlayerHandsDisplay()
    updateInfoBoxes()
}

// Update het aantal spelers
const updatePlayerCount = function(delta: number): void {
    const newCount = playerCount + delta
    if (newCount >= 2 && newCount <= 8) {
        playerCount = newCount
        playerCountInput.value = newCount.toString()
        playerManagement.setPlayerCount(newCount)
        
        // Update de UI voor de knoppen
        if (decreaseButton) decreaseButton.classList.toggle("addition-button__isDisabled", newCount <= 2)
        if (increaseButton) increaseButton.classList.toggle("addition-button__isDisabled", newCount >= 8)
        
        // Update de player hands display
        updatePlayerHandsDisplay()
    }
}

// Valideer het aantal spelers
const validatePlayerCount = function(): void {
    const value = parseInt(playerCountInput.value)
    if (value >= 2 && value <= 8) {
        playerCount = value
        playerManagement.setPlayerCount(value)
        
        // Update de UI voor de knoppen
        if (decreaseButton) decreaseButton.classList.toggle("addition-button__isDisabled", value <= 2)
        if (increaseButton) increaseButton.classList.toggle("addition-button__isDisabled", value >= 8)
        
        // Update de player hands display
        updatePlayerHandsDisplay()
    } else {
        playerCountInput.value = playerCount.toString()
    }
}

// Deel kaarten uit
const dealCards = function(): void {
    try {
        playerManagement.dealCards()
        updatePlayerHandsDisplay()
        updateInfoBoxes()
    } catch (error: unknown) {
        if (error instanceof Error) {
            alert(error.message)
        } else {
            alert("Er is een onverwachte fout opgetreden")
        }
    }
}

// Reset het deck
const resetDeck = function(): void {
    playerManagement.resetDeck()
    // We hoeven het deck niet opnieuw in te stellen omdat resetDeck al alle kaarten terugzet
    updatePlayerHandsDisplay()
    updateInfoBoxes()
}

// Update de lijst met beschikbare decks
const updateDecksList = function(): void {
    if (!decksList) return

    decksList.innerHTML = ""
    decks.forEach(deck => {
        const li = document.createElement("li")
        li.textContent = deck.getName()
        
        // Voeg actief label toe als dit het actieve deck is
        if (deck === activeDeck) {
            const activeLabel = document.createElement("span")
            activeLabel.textContent = "actief"
            activeLabel.className = "status-active"
            li.appendChild(activeLabel)
        }
        
        li.addEventListener("click", () => {
            activeDeck = deck
            // Sla het actieve deck op in localStorage
            localStorage.setItem("activeDeck", deck.getName())
            // Maak eerst de handen leeg zonder de kaarten terug te zetten
            playerManagement.clearPlayerHands()
            // Update de UI direct na het leegmaken van de handen
            updatePlayerHandsDisplay()
            // Stel dan het nieuwe deck in
            playerManagement.setDeck(deck.getCards())
            updateDecksList()
            updateInfoBoxes()
        })
        decksList.appendChild(li)
    })
}

// Initialiseer event listeners
if (decreaseButton) decreaseButton.addEventListener("click", () => updatePlayerCount(-1))
if (increaseButton) increaseButton.addEventListener("click", () => updatePlayerCount(1))
if (playerCountInput) playerCountInput.addEventListener("change", validatePlayerCount)
if (dealButton) dealButton.addEventListener("click", dealCards)
if (resetButton) resetButton.addEventListener("click", resetDeck)

// Initialiseer de UI
updateDecksList()
updatePlayerHandsDisplay()
updateInfoBoxes()