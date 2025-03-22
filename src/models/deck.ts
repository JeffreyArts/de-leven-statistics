import { CardName } from "./card"

interface ICard {
    name: CardName;
    value: number;
}

export class Deck {
    private cards: ICard[] = []
    private discardPile: ICard[] = []

    public setCards(cardNames: CardName[]): void {
        this.cards = cardNames.map(name => ({
            name,
            value: 0
        }))
        this.discardPile = []
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
        }
    }

    public draw(count: number): CardName[] {
        const drawnCards: CardName[] = []
        for (let i = 0; i < count; i++) {
            if (this.cards.length === 0) {
                // Als het deck leeg is, schud de discard pile en maak er een nieuw deck van
                this.cards = [...this.discardPile]
                this.discardPile = []
                this.shuffle()
            }
            const card = this.cards.pop()
            if (card) {
                drawnCards.push(card.name)
            }
        }
        return drawnCards
    }

    public getCards(): ICard[] {
        return this.cards
    }

    public getDiscardPile(): ICard[] {
        return this.discardPile
    }

    public discard(cards: CardName[]): void {
        this.discardPile.push(...cards.map(name => ({
            name,
            value: 0
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