import { Card } from "../models/card"
import berekenHandwaarde from "./bereken-worp"

export default function berekenScoreRange(cards: Card[], sampleSize = 100000): [number, number] {
    if (cards.length == 0) {
        return [0, 0]
    }
    // Bereken 100.000 keer de handwaarde voor de gegeven kaarten
    const scores = berekenHandwaarde(cards, sampleSize)
    
    // Bepaal de min en max door de scores te sorteren
    scores.sort((a, b) => a - b)
    const minScore = scores[0]
    const maxScore = scores[scores.length - 1]
    
    return [minScore, maxScore]
} 