import { Card, CardName, CardTypes } from "./card"

export interface DeckSerialization {
    name: string;
    cards: Array<{
        name: CardName;
        count: number;
    }>;
}

export class Deck {
    private cards: Card[] = []
    private discardPile: Card[] = []
    private name: string = "Default"

    constructor() {
        this.reset()
    }

    public setName(name: string): void {
        this.name = name
    }

    public getName(): string {
        return this.name
    }

    public setCards(cards: Card[]): void {
        this.cards = cards
        this.discardPile = []
    }

    public toSerialization(): DeckSerialization {
        const cardCounts = new Map<CardName, number>()
        this.cards.forEach(card => {
            cardCounts.set(card.name, (cardCounts.get(card.name) || 0) + 1)
        })

        return {
            name: this.name,
            cards: Array.from(cardCounts.entries()).map(([name, count]) => ({
                name,
                count
            }))
        }
    }

    public static fromSerialization(serialization: DeckSerialization): Deck {
        const deck = new Deck()
        deck.name = serialization.name
        deck.cards = serialization.cards.flatMap(({name, count}) => {
            if (CardTypes.includes(name)) {
                return Array(count).fill(new Card(name))
            } else {
                console.warn(`Ongeldige kaartnaam: ${name}`)
                return []
            }
        })
        return deck
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
        }
    }

    public draw(count: number): Card[] {
        const drawnCards: Card[] = []
        for (let i = 0; i < count; i++) {
            if (this.cards.length === 0) {
                // Als het deck leeg is, schud de discard pile en maak er een nieuw deck van
                this.cards = [...this.discardPile]
                this.discardPile = []
                this.shuffle()
            }
            const card = this.cards.pop()
            if (card) {
                drawnCards.push(card)
            }
        }
        return drawnCards
    }

    public getCards(): Card[] {
        return this.cards
    }

    public getDiscardPile(): Card[] {
        return this.discardPile
    }

    public discard(cards: Card[]): void {
        this.discardPile.push(...cards)
    }

    public addCard(card: Card): void {
        this.cards.push(card)
    }

    public removeCard(card: Card): void {
        const index = this.cards.findIndex(c => c.name === card.name)
        if (index !== -1) {
            this.cards.splice(index, 1)
        }
    }

    public clear(): void {
        this.cards = []
    }

    public reset(): void {
        this.cards = []
        this.discardPile = []
    }
} 