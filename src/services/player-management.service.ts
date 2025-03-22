import { Card } from "../models/card"
import berekenHandwaarde from "../utilities/bereken-handwaarde"
import { Deck } from "../models/deck"
import { Player, PlayerSerialization } from "../models/player"

export class PlayerManagementService {
    private playerCount: number
    private deck: Deck
    private players: Player[] = []

    constructor() {
        this.deck = new Deck()
        this.playerCount = 2 // Default waarde
        this.loadPlayers()
    }

    private loadPlayers(): void {
        const savedPlayers = localStorage.getItem("players")
        if (savedPlayers) {
            const playersData: Array<[number, PlayerSerialization]> = JSON.parse(savedPlayers)
            this.players = playersData.map(([_, data]) => Player.fromSerialization(data))
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
        } else {
            const newPlayer = new Player(name)
            this.players[playerNumber - 1] = newPlayer
            this.savePlayers()
        }
    }

    public updatePlayerSelectedCards(playerNumber: number, selectedCards: Card[]): void {
        const player = this.players[playerNumber - 1]
        if (player) {
            player.setSelectedCards(selectedCards)
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
            player.setSelectedCards([])
            
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

        // Reset de handen
        this.players = []
        
        // Deel 5 kaarten aan elke speler
        for (let i = 0; i < this.playerCount; i++) {
            const playerCards = this.deck.draw(5)
            const player = new Player(`Speler ${i + 1}`)
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
            player.setSelectedCards([])
        })
        
        this.savePlayers()
        
        // Reset het deck door alle kaarten terug te zetten
        const allCards = [...this.deck.getCards(), ...this.deck.getDiscardPile()]
        this.deck = new Deck()
        this.deck.setCards(allCards)
        this.deck.shuffle()
    }
} 