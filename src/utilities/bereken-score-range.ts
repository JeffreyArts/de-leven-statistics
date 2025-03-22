import { Card } from "../models/card"
import berekenHandwaarde from "./bereken-handwaarde"

export default function berekenScoreRange(cards: Card[]): [number, number] {
    if (cards.length == 0) {
        return [0, 0]
    }
    // Bereken 100.000 keer de handwaarde voor de gegeven kaarten
    const scores = berekenHandwaarde(cards, 100000)
    
    // Bepaal de min en max door de scores te sorteren
    scores.sort((a, b) => a - b)
    const minScore = scores[0]
    const maxScore = scores[scores.length - 1]
    
    return [minScore, maxScore]
} 