import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/generate-hand-values.scss"
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

// Selecteer de UI elementen
const generateButton = document.getElementById("generate-button") as HTMLButtonElement
const stopButton = document.getElementById("stop-button") as HTMLButtonElement
const simulationCountInput = document.getElementById("simulation-count") as HTMLInputElement
const textarea = document.getElementById("output-textarea") as HTMLTextAreaElement
const status = document.getElementById("status") as HTMLSpanElement
const copyButton = document.getElementById("copy-button") as HTMLButtonElement

let shouldStop = false

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

// Event listener voor de stop knop
stopButton.addEventListener("click", () => {
    shouldStop = true
    stopButton.disabled = true
    status.textContent = "Stoppen..."
})

// Event listener voor de copy knop
copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(textarea.value)
        status.textContent = "Gekopieerd naar klembord!"
        setTimeout(() => {
            status.textContent = "Klaar! Je kunt nu de JSON kopiëren."
        }, 2000)
    } catch (err) {
        status.textContent = "Kon niet kopiëren naar klembord"
    }
})

// Event listener voor de knop
generateButton.addEventListener("click", async () => {
    // Reset de stop status
    shouldStop = false
    stopButton.style.display = "block"
    stopButton.disabled = false
    generateButton.disabled = true
    status.textContent = "Bezig met genereren... 0 combinaties verwerkt"
    
    // Haal het aantal simulaties op
    const simulationCount = parseInt(simulationCountInput.value) || 1000000
    
    // Genereer alle mogelijke combinaties van 1 tot 5 kaarten
    const alleCombinaties = genereerCombinaties(hand, 1, 5)
    let verwerkteCombinaties = 0
    
    for (const combinatie of alleCombinaties) {
        if (shouldStop) {
            status.textContent = "Genereren gestopt"
            break
        }

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
        const range = berekenScoreRange(combinatie, simulationCount)
        
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
    
    status.textContent = shouldStop ? "Genereren gestopt" : "Klaar! Je kunt nu de JSON kopiëren."
    generateButton.disabled = false
    stopButton.disabled = true
    stopButton.style.display = "none"
}) 