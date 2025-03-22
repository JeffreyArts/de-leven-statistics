import { Card, CardName } from "../models/card"
import berekenHandwaarde from "../utilities/bereken-handwaarde"
import { Deck } from "../models/deck"

interface PlayerHand {
    cards: Card[];
    maxScore: [number, number];
}

export class PlayerManagementService {
    private playerCount: number
    private playerCountInput: HTMLInputElement
    private decreaseButton: HTMLButtonElement
    private increaseButton: HTMLButtonElement
    private dealButton: HTMLButtonElement
    private playerHandsList: HTMLDivElement
    private deck: Deck
    private playerHands: Map<number, PlayerHand> = new Map()

    constructor() {
        this.playerCountInput = document.getElementById("player-count") as HTMLInputElement
        this.decreaseButton = document.getElementById("decrease-players") as HTMLButtonElement
        this.increaseButton = document.getElementById("increase-players") as HTMLButtonElement
        this.dealButton = document.getElementById("deal-cards") as HTMLButtonElement
        this.playerHandsList = document.getElementById("player-hands-list") as HTMLDivElement
        this.deck = new Deck()

        // Voeg de addition-button class toe aan de plus/min knoppen
        if (this.decreaseButton) this.decreaseButton.classList.add("addition-button")
        if (this.increaseButton) this.increaseButton.classList.add("addition-button")

        // Initialiseer playerCount met de waarde uit de input
        this.playerCount = parseInt(this.playerCountInput.value) || 2

        // Initialiseer de disabled status van de knoppen
        this.decreaseButton.classList.toggle("addition-button__isDisabled", this.playerCount <= 2)
        this.increaseButton.classList.toggle("addition-button__isDisabled", this.playerCount >= 8)

        this.initializeEventListeners()
        this.updateInfoBoxes()
        this.updatePlayerHandsDisplay()
    }

    private initializeEventListeners(): void {
        this.decreaseButton.addEventListener("click", () => this.updatePlayerCount(-1))
        this.increaseButton.addEventListener("click", () => this.updatePlayerCount(1))
        this.playerCountInput.addEventListener("change", () => this.validatePlayerCount())
        this.dealButton.addEventListener("click", () => this.dealCards())
    }

    private updatePlayerCount(delta: number): void {
        const newCount = this.playerCount + delta
        if (newCount >= 2 && newCount <= 8) {
            this.playerCount = newCount
            this.playerCountInput.value = this.playerCount.toString()
            
            // Update de disabled status van de knoppen
            this.decreaseButton.classList.toggle("addition-button__isDisabled", newCount <= 2)
            this.increaseButton.classList.toggle("addition-button__isDisabled", newCount >= 8)
            
            this.updatePlayerHandsDisplay()
        }
    }

    private validatePlayerCount(): void {
        const value = parseInt(this.playerCountInput.value)
        if (value >= 2 && value <= 8) {
            this.playerCount = value
            
            // Update de disabled status van de knoppen
            this.decreaseButton.classList.toggle("addition-button__isDisabled", value <= 2)
            this.increaseButton.classList.toggle("addition-button__isDisabled", value >= 8)
            
            this.updatePlayerHandsDisplay()
        } else {
            this.playerCountInput.value = this.playerCount.toString()
        }
    }

    private updatePlayerHandsDisplay(): void {
        this.playerHandsList.innerHTML = ""
        for (let i = 1; i <= this.playerCount; i++) {
            const playerHand = document.createElement("div")
            playerHand.className = "player-hand"
            
            const header = document.createElement("h4")
            header.textContent = `Speler ${i}`
            const scoreContainer = document.createElement("div")
            scoreContainer.className = "score-container"
            
            const selectedScore = document.createElement("span")
            selectedScore.className = "score selected-score"
            selectedScore.textContent = "[x, x]"
            
            const maxScore = document.createElement("span")
            maxScore.className = "score max-score"
            maxScore.textContent = "[x, x]"
            
            scoreContainer.appendChild(selectedScore)
            scoreContainer.appendChild(maxScore)
            header.appendChild(scoreContainer)
            
            const cards = document.createElement("div")
            cards.className = "cards"
            
            const playButton = document.createElement("button")
            playButton.className = "play-hand-button"
            playButton.textContent = "Speel hand"
            playButton.addEventListener("click", () => this.playHand(i))
            
            playerHand.appendChild(header)
            playerHand.appendChild(cards)
            playerHand.appendChild(playButton)
            this.playerHandsList.appendChild(playerHand)
        }
    }

    private updateInfoBoxes(): void {
        const cardsInDeckEl = document.getElementById("cards-in-deck")
        const cardsInDiscardEl = document.getElementById("cards-in-discard")
        
        if (cardsInDeckEl) {
            const deckSize = this.deck.getCards().length
            cardsInDeckEl.textContent = deckSize.toString()
        }
        if (cardsInDiscardEl) {
            const discardSize = this.deck.getDiscardPile().length
            cardsInDiscardEl.textContent = discardSize.toString()
        }
    }

    private updatePlayerScore(playerNumber: number): void {
        const playerHand = this.playerHands.get(playerNumber)
        if (!playerHand) return

        const selectedCards = playerHand.cards.filter(card => {
            const cardElement = this.playerHandsList
                .querySelector(`.player-hand:nth-child(${playerNumber}) .cards`)
                ?.querySelector(`.card:nth-child(${playerHand.cards.indexOf(card) + 1})`)
            return cardElement?.classList.contains("selected")
        })

        // Bereken 100.000 keer de handwaarde voor geselecteerde kaarten
        const selectedScores = []
        for (let i = 0; i < 100000; i++) {
            const result = berekenHandwaarde(selectedCards)
            selectedScores.push(...result)
        }

        // Bepaal de min en max door de scores te sorteren
        selectedScores.sort((a, b) => a - b)
        const selectedMinScore = selectedScores[0]
        const selectedMaxScore = selectedScores[selectedScores.length - 1]

        const selectedScoreElement = this.playerHandsList
            .querySelector(`.player-hand:nth-child(${playerNumber}) .selected-score`)
        const maxScoreElement = this.playerHandsList
            .querySelector(`.player-hand:nth-child(${playerNumber}) .max-score`)

        if (selectedScoreElement) {
            if (selectedScores.length === 0) {
                selectedScoreElement.textContent = "[x, x]"
            } else if (selectedMinScore === selectedMaxScore) {
                selectedScoreElement.textContent = `[${selectedMinScore}, ${selectedMinScore}]`
            } else {
                selectedScoreElement.textContent = `[${selectedMinScore}, ${selectedMaxScore}]`
            }
        }

        if (maxScoreElement) {
            const [maxMinScore, maxMaxScore] = playerHand.maxScore
            maxScoreElement.textContent = `[${maxMinScore}, ${maxMaxScore}]`
        }
    }

    private playHand(playerNumber: number): void {
        const playerHand = this.playerHands.get(playerNumber)
        if (!playerHand) return

        const selectedCards = playerHand.cards.filter(card => {
            const cardElement = this.playerHandsList
                .querySelector(`.player-hand:nth-child(${playerNumber}) .cards`)
                ?.querySelector(`.card:nth-child(${playerHand.cards.indexOf(card) + 1})`)
            return cardElement?.classList.contains("selected")
        })

        if (selectedCards.length > 0) {
            // Verplaats geselecteerde kaarten naar de discard pile
            this.deck.discard(selectedCards.map(card => card.name))
            
            // Verwijder de geselecteerde kaarten uit de hand
            playerHand.cards = playerHand.cards.filter(card => !selectedCards.includes(card))
            
            // Vul de hand aan tot 5 kaarten
            const cardsToDraw = 5 - playerHand.cards.length
            if (cardsToDraw > 0) {
                const newCards = this.deck.draw(cardsToDraw).map(cardName => new Card(cardName as CardName))
                playerHand.cards.push(...newCards)
            }
            
            // Update de UI voor alleen deze speler
            const cardsContainer = this.playerHandsList
                .querySelector(`.player-hand:nth-child(${playerNumber}) .cards`)
            if (cardsContainer) {
                cardsContainer.innerHTML = ""
                playerHand.cards.forEach(card => {
                    const cardElement = document.createElement("div")
                    cardElement.className = "card"
                    cardElement.textContent = card.name
                    cardElement.addEventListener("click", () => {
                        cardElement.classList.toggle("selected")
                        this.updatePlayerScore(playerNumber)
                    })
                    cardsContainer.appendChild(cardElement)
                })
            }

            // Update de score en info boxes
            this.updatePlayerScore(playerNumber)
            this.updateInfoBoxes()
        }
    }

    public setDeck(deck: Card[]): void {
        const cardNames = deck.map(card => card.name)
        this.deck.setCards(cardNames)
        this.deck.shuffle()
        this.updateInfoBoxes()
    }

    public dealCards(): void {
        const deckSize = this.deck.getCards().length
        if (deckSize < this.playerCount * 5) {
            alert("Er zijn niet genoeg kaarten in het deck om aan alle spelers te delen!")
            return
        }

        // Verplaats alle oude kaarten naar de discard pile
        this.playerHands.forEach(hand => {
            this.deck.discard(hand.cards.map(card => card.name))
        })

        // Reset de handen
        this.updatePlayerHandsDisplay()
        this.playerHands.clear()
        
        // Deel 5 kaarten aan elke speler
        const playerHands = this.playerHandsList.querySelectorAll(".cards")
        playerHands.forEach((hand, index) => {
            const playerCards = this.deck.draw(5).map(cardName => new Card(cardName as CardName))
            this.playerHands.set(index + 1, {
                cards: playerCards,
                maxScore: [0, 0]
            })
            
            // Update de UI voor deze speler
            hand.innerHTML = ""
            playerCards.forEach(card => {
                const cardElement = document.createElement("div")
                cardElement.className = "card"
                cardElement.textContent = card.name
                cardElement.addEventListener("click", () => {
                    cardElement.classList.toggle("selected")
                    this.updatePlayerScore(index + 1)
                })
                hand.appendChild(cardElement)
            })
        })

        // Update de info boxes
        this.updateInfoBoxes()
    }
} 