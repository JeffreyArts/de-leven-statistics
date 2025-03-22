import { Card, CardName } from "./card"

export interface PlayerSerialization {
    name: string;
    hand: CardName[];
    selectedCards: CardName[];
    scoreRange: [number, number];
    selectedScoreRange: [number, number];
    handValue: number;
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
    }

    public setSelectedCards(selectedCards: Card[]): void {
        this.selectedCards = selectedCards
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

    // Serialisatie methodes
    public toSerialization(): PlayerSerialization {
        return {
            name: this.name,
            hand: this.hand.map(card => card.name),
            selectedCards: this.selectedCards.map(card => card.name),
            scoreRange: this.scoreRange,
            selectedScoreRange: this.selectedScoreRange,
            handValue: this.handValue
        }
    }

    public static fromSerialization(serialization: PlayerSerialization): Player {
        const player = new Player(serialization.name)
        player.hand = serialization.hand.map(cardName => new Card(cardName))
        player.selectedCards = serialization.selectedCards.map(cardName => new Card(cardName))
        player.scoreRange = serialization.scoreRange
        player.selectedScoreRange = serialization.selectedScoreRange
        player.handValue = serialization.handValue
        return player
    }
} 