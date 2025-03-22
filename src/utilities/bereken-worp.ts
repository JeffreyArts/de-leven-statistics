import berekenOgen from "./bereken-ogen"
import { Card } from "../models/card"

const berekenWorp = function(kaarten: Card[], aantalWorpen = 1) {

    const handWaarde = [] as number[]

    for (let i = 0; i < aantalWorpen; i++) {
        let dice = 1
        let doubleThrow = false
        let bestOf3 = false
        let diceResult = 0
        let achterwaarts = false

        // Verwerk extra dobbelsteen
        kaarten.forEach(card => {  
            if (card.name == "Extra dobbelsteen") {
                dice ++
            }

            if (card.name == "Meerdere dobbelstenen") {
                dice = Math.ceil(Math.random() * 6)
            }

            if (card.name == "Dubbele worp") {
                doubleThrow = true
            }

            if (card.name == "Best of 3") {
                bestOf3 = true
            }

            if (card.name == "Achterwaarts") {
                achterwaarts = true
            }
        })
        
        diceResult = berekenOgen(dice, doubleThrow)
        if (bestOf3) {
            const poging2 = berekenOgen(dice, doubleThrow)
            const poging3 = berekenOgen(dice, doubleThrow)

            if (poging2 > diceResult) {
                diceResult = poging2
            }
            if (poging3 > diceResult) {
                diceResult = poging3
            }
        }

        if (achterwaarts) {
            diceResult *= -1
        }
        
        handWaarde.push(diceResult)
    }
    
    return handWaarde
}

export default berekenWorp