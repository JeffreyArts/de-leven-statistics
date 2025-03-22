import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import {Card, CardTypes} from "./../models/card"
import berekenScoreRange from "../utilities/bereken-score-range"

const hand = [] as Array<Card>
const throws = [] as Array<{
    kaarten: string[],
    range: number[],
    appliedToSelf: boolean,
    switchPosition: boolean,
    appliedToOthers: number
}>

// Initialiseer alle kaarten
for(let i = 0; i < CardTypes.length; i++) {
    hand.push(new Card(CardTypes[i]))
}

// Maak de UI elementen
const container = document.createElement("div")
container.classList.add("container")
document.body.appendChild(container)

const title = document.createElement("h1")
title.textContent = "Genereer Hand Waarden"
container.appendChild(title)

const button = document.createElement("button")
button.textContent = "Genereer combinaties"
button.classList.add("primary-button")
container.appendChild(button)

const textarea = document.createElement("textarea")
textarea.style.width = "100%"
textarea.style.height = "400px"
textarea.style.marginTop = "20px"
textarea.style.padding = "10px"
container.appendChild(textarea)

const status = document.createElement("div")
status.style.marginTop = "10px"
container.appendChild(status)

// Functie om alle mogelijke combinaties te genereren
function genereerCombinaties(kaarten: Card[], min: number, max: number): Card[][] {
    const resultaat: Card[][] = []
    
    function combineer(huidige: Card[], start: number, diepte: number) {
        if (diepte >= min && diepte <= max) {
            resultaat.push([...huidige])
        }
        
        if (diepte >= max) return
        
        for (let i = start; i < kaarten.length; i++) {
            huidige.push(kaarten[i])
            combineer(huidige, i + 1, diepte + 1)
            huidige.pop()
        }
    }
    
    combineer([], 0, 0)
    return resultaat
}

// Event listener voor de knop
button.addEventListener("click", async () => {
    button.disabled = true
    status.textContent = "Bezig met genereren... 0 combinaties verwerkt"
    
    // Genereer alle mogelijke combinaties van 1 tot 5 kaarten
    const alleCombinaties = genereerCombinaties(hand, 1, 5)
    let verwerkteCombinaties = 0
    
    for (const combinatie of alleCombinaties) {
        const kaarten = combinatie.map(card => card.name)
        
        // Bepaal appliedToSelf
        const appliedToSelf = !kaarten.some(card => 
            card === "Speler links" || 
            card === "Speler rechts" || 
            card === "Links, rechts"
        )
        
        // Bepaal appliedToOthers
        let appliedToOthers = 0
        if (kaarten.includes("Speler links") || kaarten.includes("Speler rechts")) {
            appliedToOthers = 1
        } else if (kaarten.includes("Links, rechts")) {
            appliedToOthers = 2
        } else if (kaarten.includes("Iedereen")) {
            appliedToOthers = 99
        }
        
        // Bepaal switchPosition
        const switchPosition = kaarten.includes("Wissel positie")
        
        // Bereken de range voor deze combinatie
        const range = berekenScoreRange(combinatie, 10000000)
        
        throws.push({
            kaarten: [kaarten.join(", ")],
            range,
            appliedToSelf,
            switchPosition,
            appliedToOthers
        })
        
        verwerkteCombinaties++
        status.textContent = `Bezig met genereren... ${verwerkteCombinaties} van ${alleCombinaties.length} combinaties verwerkt`
        
        // Voeg een kleine vertraging toe om de updates te kunnen zien
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // Converteer naar JSON string
    const jsonString = JSON.stringify(throws, null, 2)
    textarea.value = jsonString
    
    status.textContent = "Klaar! Je kunt nu de JSON kopiëren."
    button.disabled = false
}) 