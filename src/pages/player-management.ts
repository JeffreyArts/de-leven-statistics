import { Card, CardName } from "../models/card"
import berekenHandwaarde from "../utilities/bereken-handwaarde"
import { Deck } from "../models/deck"

interface PlayerHand {
    cards: Card[];
    maxScore: [number, number];
}

export class PlayerManagement {
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

        // Initialiseer playerCount met de waarde uit de input
        this.playerCount = parseInt(this.playerCountInput.value) || 2

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
            this.updatePlayerHandsDisplay()
        }
    }

    private validatePlayerCount(): void {
        const value = parseInt(this.playerCountInput.value)
        if (value >= 2 && value <= 8) {
            this.playerCount = value
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
            
            const playHandButton = document.createElement("button")
            playHandButton.className = "play-hand-button"
            playHandButton.textContent = "speel kaarten"
            playHandButton.addEventListener("click", () => this.playHand(i))
            
            playerHand.appendChild(header)
            playerHand.appendChild(cards)
            playerHand.appendChild(playHandButton)
            this.playerHandsList.appendChild(playerHand)
        }
    }

    private updateInfoBoxes(): void {
        const cardsInDeckEl = document.getElementById("cards-in-deck")
        const cardsInDiscardEl = document.getElementById("cards-in-discard")
        
        if (cardsInDeckEl) {
            cardsInDeckEl.textContent = this.deck.getCards().length.toString()
        }
        if (cardsInDiscardEl) {
            cardsInDiscardEl.textContent = this.deck.getDiscardPile().length.toString()
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

        // Reset de handen
        this.updatePlayerHandsDisplay()
        this.playerHands.clear()
        
        // Deel 5 kaarten aan elke speler
        const playerHands = this.playerHandsList.querySelectorAll(".cards")
        playerHands.forEach((hand, index) => {
            const playerCards = this.deck.draw(5).map(cardName => new Card(cardName as CardName))
            
            // Bereken de maximale score voor alle kaarten
            const maxScores = []
            for (let i = 0; i < 100000; i++) {
                const result = berekenHandwaarde(playerCards)
                maxScores.push(...result)
            }
            maxScores.sort((a, b) => a - b)
            const maxScore: [number, number] = [maxScores[0], maxScores[maxScores.length - 1]]
            
            // Sla de hand en maximale score op in de playerHands map
            this.playerHands.set(index + 1, {
                cards: playerCards,
                maxScore
            })
            
            // Update de maximale score in de UI
            const maxScoreElement = this.playerHandsList
                .querySelector(`.player-hand:nth-child(${index + 1}) .max-score`)
            if (maxScoreElement) {
                maxScoreElement.textContent = `[${maxScore[0]}, ${maxScore[1]}]`
            }
            
            // Maak de hand leeg
            hand.innerHTML = ""
            
            // Voeg elke kaart toe als een lijst item
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

        this.updateInfoBoxes()
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

        // Verwijder de geselecteerde kaarten uit de hand
        playerHand.cards = playerHand.cards.filter(card => !selectedCards.includes(card))

        // Update de UI
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

        // Update de score
        this.updatePlayerScore(playerNumber)
    }
} 