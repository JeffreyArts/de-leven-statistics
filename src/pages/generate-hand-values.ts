import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/generate-hand-values.scss"
import {Card, CardTypes} from "./../models/card"
import berekenScoreRange from "../utilities/bereken-score-range"
import berekenHandwaarde from "../utilities/bereken-worp"

const hand = [] as Array<Card>
const throws = [] as Array<{
    kaarten: string[],
    range: number[],
    appliedToSelf: boolean,
    switchPosition: boolean,
    appliedToOthers: number,
    kansen: { waarde: number; percentage: number }[]
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
const downloadButton = document.getElementById("download-button") as HTMLButtonElement

// Verberg de knoppen bij het laden
copyButton.style.display = "none"
downloadButton.style.display = "none"

let shouldStop = false

// Functie om alle mogelijke combinaties te genereren
function genereerCombinaties(kaarten: Card[], min: number, max: number): Card[][] {
    const resultaat: Card[][] = []
    const kaartTelling = new Map<string, number>()
    
    // Initialiseer de telling voor elke kaart
    kaarten.forEach(kaart => {
        kaartTelling.set(kaart.name, 0)
    })
    
    function combineer(huidige: Card[], start: number, diepte: number) {
        // 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 TIJDELIJK MAXIMAAL 16 COMBINATIES
        // if (resultaat.length >= 16) return
        
        if (diepte >= min && diepte <= max) {
            resultaat.push([...huidige])
        }
        
        if (diepte >= max) return
        
        for (let i = start; i < kaarten.length; i++) {
            const huidigeKaart = kaarten[i]
            const huidigeTelling = kaartTelling.get(huidigeKaart.name) || 0
            
            // Controleer of we deze kaart nog meer kunnen gebruiken
            if (huidigeTelling < 5) {
                huidige.push(huidigeKaart)
                kaartTelling.set(huidigeKaart.name, huidigeTelling + 1)
                combineer(huidige, i, diepte + 1)
                huidige.pop()
                kaartTelling.set(huidigeKaart.name, huidigeTelling)
            }
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

// Event listener voor de download knop
downloadButton.addEventListener("click", () => {
    const jsonString = textarea.value
    if (!jsonString) {
        status.textContent = "Geen data om te downloaden"
        return
    }

    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hand-waarden.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    status.textContent = "Bestand gedownload!"
    setTimeout(() => {
        status.textContent = "Klaar! Je kunt nu de JSON kopiëren of downloaden."
    }, 2000)
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
        
        // Bereken de handwaarde voor deze combinatie
        const handwaarden = berekenHandwaarde(combinatie, simulationCount)
        
        // Bereken de kansen voor deze handwaarden
        const kansen = handwaarden.reduce((acc, num) => {
            acc[num] = (acc[num] || 0) + 1
            return acc
        }, {} as Record<number, number>)

        // Converteer de kansen naar percentages
        const kansenMetPercentages = Object.entries(kansen).map(([waarde, aantal]) => ({
            waarde: parseInt(waarde),
            percentage: (aantal / simulationCount) * 100
        })).sort((a, b) => b.percentage - a.percentage)
        
        // Bereken de range (min en max waarde)
        const min = handwaarden.reduce((a, b) => Math.min(a, b))
        const max = handwaarden.reduce((a, b) => Math.max(a, b))
        const range = [min, max]
        
        throws.push({
            kaarten: [kaarten.join(", ")],
            range,
            appliedToSelf,
            switchPosition,
            appliedToOthers,
            kansen: kansenMetPercentages
        })
        
        verwerkteCombinaties++
        status.textContent = `Bezig met genereren... ${verwerkteCombinaties} van ${alleCombinaties.length} combinaties verwerkt`
        
        // Voeg een kleine vertraging toe om de updates te kunnen zien
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // Converteer naar JSON string
    const jsonString = JSON.stringify(throws, null, 2)
    textarea.value = jsonString
    
    // Toon de knoppen als er data is
    if (jsonString) {
        copyButton.style.display = "inline-block"
        downloadButton.style.display = "inline-block"
    }
    
    status.textContent = shouldStop ? "Genereren gestopt" : "Klaar! Je kunt nu de JSON kopiëren of downloaden."
    generateButton.disabled = false
    stopButton.disabled = true
    stopButton.style.display = "none"
}) 