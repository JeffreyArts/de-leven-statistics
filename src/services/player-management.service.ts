import { Player } from "../models/player"
import { Deck } from "../models/deck"
import { Card } from "../models/card"
import { PlayerSerialization } from "../models/player"

export class PlayerManagementService {
    private playerCount: number
    private deck: Deck
    private players: Player[] = []

    constructor() {
        this.deck = new Deck()
        this.playerCount = 2 // Default waarde
    }

    public loadAndAdjustDeck(): void {
        this.loadPlayers()
        
        // Verwijder alle kaarten die in de handen van spelers zitten uit het deck
        this.players.forEach(player => {
            const cardsInHand = player.getHand()
            this.deck.removeCards(cardsInHand)
        })
    }

    private loadPlayers(): void {
        const savedPlayers = localStorage.getItem("players")
        if (savedPlayers) {
            const playersData: Array<[number, PlayerSerialization]> = JSON.parse(savedPlayers)
            this.players = playersData.map(([, data]) => {
                const player = Player.fromSerialization(data)
                // Reset selectedCards bij het laden
                player.getSelectedCards().forEach(card => player.removeSelectedCard(card))
                return player
            })
            this.playerCount = this.players.length
        }
    }

    private savePlayers(): void {
        const playersData: Array<[number, PlayerSerialization]> = this.players.map((player, index) => [index + 1, player.toSerialization()])
        localStorage.setItem("players", JSON.stringify(playersData))
    }

    public getPlayerCount(): number {
        return this.playerCount
    }

    public setPlayerCount(count: number): void {
        if (count >= 2 && count <= 8) {
            // Als we spelers toevoegen
            if (count > this.playerCount) {
                for (let i = this.playerCount; i < count; i++) {
                    this.players.push(new Player(`Speler ${i + 1}`))
                }
            }
            // Als we spelers verwijderen
            else if (count < this.playerCount) {
                this.players = this.players.slice(0, count)
            }
            
            this.playerCount = count
            this.savePlayers()
        }
    }

    public getPlayer(playerNumber: number): Player | undefined {
        return this.players[playerNumber - 1]
    }

    public getAllPlayers(): Player[] {
        return this.players
    }

    public updatePlayerName(playerNumber: number, name: string): void {
        const player = this.players[playerNumber - 1]
        if (player) {
            player.setName(name)
            this.savePlayers()
        }
    }

    public addPlayerSelectedCard(playerNumber: number, card: Card): void {
        const player = this.players[playerNumber - 1]
        if (player) {
            player.addSelectedCard(card)
            this.savePlayers()
        }
    }

    public removePlayerSelectedCard(playerNumber: number, card: Card): void {
        const player = this.players[playerNumber - 1]
        if (player) {
            player.removeSelectedCard(card)
            this.savePlayers()
        }
    }

    public getDeckSize(): number {
        return this.deck.getCards().length
    }

    public getDiscardPileSize(): number {
        return this.deck.getDiscardPile().length
    }

    public playHand(playerNumber: number): void {
        const player = this.players[playerNumber - 1]
        if (!player) return

        const selectedCards = player.getSelectedCards()

        if (selectedCards.length > 0) {
            // Verplaats geselecteerde kaarten naar de discard pile
            this.deck.discard(selectedCards)
            
            // Verwijder de geselecteerde kaarten uit de hand
            const remainingCards = player.getHand().filter(card => !selectedCards.includes(card))
            player.setHand(remainingCards)
            // Reset geselecteerde kaarten door ze één voor één te verwijderen
            selectedCards.forEach(card => player.removeSelectedCard(card))
            
            // Vul de hand aan tot 5 kaarten
            const cardsToDraw = 5 - remainingCards.length
            if (cardsToDraw > 0) {
                const newCards = this.deck.draw(cardsToDraw)
                player.setHand([...remainingCards, ...newCards])
            }
            
            this.savePlayers()
        }
    }

    public setDeck(deck: Card[]): void {
        this.deck.setCards(deck)
        this.deck.shuffle()
    }

    public dealCards(): void {
        const deckSize = this.deck.getCards().length
        if (deckSize < this.playerCount * 5) {
            throw new Error("Er zijn niet genoeg kaarten in het deck om aan alle spelers te delen!")
        }

        // Verplaats alle oude kaarten naar de discard pile
        this.players.forEach(player => {
            this.deck.discard(player.getHand())
        })

        // Reset de handen maar behoud de spelernamen
        const playerNames = this.players.map(player => player.getName())
        this.players = []
        
        // Deel 5 kaarten aan elke speler
        for (let i = 0; i < this.playerCount; i++) {
            const playerCards = this.deck.draw(5)
            const player = new Player(playerNames[i] || `Speler ${i + 1}`)
            player.setHand(playerCards)
            this.players.push(player)
        }

        this.savePlayers()
    }

    public resetDeck(): void {
        // Verplaats alle kaarten uit de handen naar de discard pile
        this.players.forEach(player => {
            this.deck.discard(player.getHand())
        })
        
        // Maak alle handen leeg
        this.players.forEach(player => {
            player.setHand([])
            // Reset geselecteerde kaarten door ze één voor één te verwijderen
            player.getSelectedCards().forEach(card => player.removeSelectedCard(card))
        })
        
        this.savePlayers()
        
        // Reset het deck door alle kaarten terug te zetten
        const allCards = [...this.deck.getCards(), ...this.deck.getDiscardPile()]
        this.deck = new Deck()
        this.deck.setCards(allCards)
        this.deck.shuffle()
    }

    public clearPlayerHands(): void {
        this.players.forEach(player => {
            player.setHand([])
            // Reset geselecteerde kaarten door ze één voor één te verwijderen
            player.getSelectedCards().forEach(card => player.removeSelectedCard(card))
        })
        this.savePlayers()
    }
} 