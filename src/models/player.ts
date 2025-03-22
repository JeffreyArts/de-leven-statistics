import { Card, CardName } from "./card"
import berekenScoreRange from "../utilities/bereken-score-range"

export interface PlayerSerialization {
    name: string;
    hand: CardName[];
}

export class Player {
    private hand: Card[] = []
    private name: string
    private selectedCards: Card[] = []
    private scoreRange: [number, number] = [0, 0]
    private selectedScoreRange: [number, number] = [0, 0]
    private handValue: number = 0

    constructor(name: string) {
        this.name = name
    }

    // Getters
    public getHand(): Card[] {
        return this.hand
    }

    public getName(): string {
        return this.name
    }

    public getSelectedCards(): Card[] {
        return this.selectedCards
    }

    public getScoreRange(): [number, number] {
        return this.scoreRange
    }

    public getSelectedScoreRange(): [number, number] {
        return this.selectedScoreRange
    }

    public getHandValue(): number {
        return this.handValue
    }

    // Setters
    public setName(name: string): void {
        this.name = name
    }

    public setHand(hand: Card[]): void {
        this.hand = hand
        console.log(this.hand)
        this.updateScoreRange()
    }

    public addSelectedCard(card: Card): void {
        if (!this.selectedCards.includes(card)) {
            this.selectedCards.push(card)
            this.updateSelectedScoreRange()
        }
    }

    public removeSelectedCard(card: Card): void {
        this.selectedCards = this.selectedCards.filter(c => c !== card)
        this.updateSelectedScoreRange()
    }

    public setScoreRange(scoreRange: [number, number]): void {
        this.scoreRange = scoreRange
    }

    public setSelectedScoreRange(selectedScoreRange: [number, number]): void {
        this.selectedScoreRange = selectedScoreRange
    }

    public setHandValue(handValue: number): void {
        this.handValue = handValue
    }

    // Helper methodes voor het updaten van de score ranges
    private updateScoreRange(): void {
        this.scoreRange = berekenScoreRange(this.hand)
    }

    private updateSelectedScoreRange(): void {
        this.selectedScoreRange = berekenScoreRange(this.selectedCards)
    }

    // Serialisatie methodes
    public toSerialization(): PlayerSerialization {
        return {
            name: this.name,
            hand: this.hand.map(card => card.name)
        }
    }

    public static fromSerialization(serialization: PlayerSerialization): Player {
        const player = new Player(serialization.name)
        player.hand = serialization.hand.map(cardName => new Card(cardName))
        // Bereken de score ranges opnieuw
        player.updateScoreRange()
        return player
    }
} 