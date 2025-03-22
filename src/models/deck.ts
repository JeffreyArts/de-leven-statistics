import { ICard } from "./card"

export class Deck {
    private cards: ICard[]
    private discardPile: ICard[]

    constructor() {
        this.cards = []
        this.discardPile = []
    }

    public setCards(cards: string[]): void {
        this.cards = cards.map(card => ({
            name: card,
            value: 0, // Deze waarden worden niet gebruikt voor de berekening
            suit: ""
        }))
        this.discardPile = []
    }

    public getCards(): ICard[] {
        return this.cards
    }

    public getDiscardPile(): ICard[] {
        return this.discardPile
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
        }
    }

    public draw(count: number): string[] {
        const drawnCards = this.cards.splice(0, count)
        return drawnCards.map(card => card.name)
    }

    public discard(cards: string[]): void {
        this.discardPile.push(...cards.map(card => ({
            name: card,
            value: 0,
            suit: ""
        })))
    }

    public addCard(card: ICard): void {
        this.cards.push(card)
    }

    public removeCard(card: ICard): void {
        const index = this.cards.findIndex(c => c.name === card.name)
        if (index !== -1) {
            this.cards.splice(index, 1)
        }
    }

    public clear(): void {
        this.cards = []
    }
} 