import berekenWorp from "./bereken-worp"
import { Card } from "../models/card"

const berekenHandwaarde = function(kaarten: Card[], aantalWorpen = 1) {

    const handWaarde = [] as number[]

    for (let i = 0; i < aantalWorpen; i++) {
        let dice = 1
        let doubleThrow = false
        let bestOf3 = false
        let diceResult = 0

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
        })
        
        diceResult = berekenWorp(dice, doubleThrow)
        if (bestOf3) {
            const poging2 = berekenWorp(dice, doubleThrow)
            const poging3 = berekenWorp(dice, doubleThrow)

            if (poging2 > diceResult) {
                diceResult = poging2
            }
            if (poging3 > diceResult) {
                diceResult = poging3
            }
        }
        handWaarde.push(diceResult)
    }
    
    return handWaarde
}

export default berekenHandwaarde