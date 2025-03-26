import "/src/scss/style.scss"
import "/src/scss/kaart-rating.scss"
import { HandPowerGraph, HandWaarde } from "../components/hand-power-graph"
import { CardName } from "../models/card"

interface KaartKans {
    waarde: number;
    percentage: number;
}

interface KaartConfig {
    kaarten: CardName[];
    range: number[];
    appliedToSelf: boolean;
    switchPosition: boolean;
    appliedToOthers: number;
    kansen: KaartKans[];
}

// Laad de hand-waarden.json data
const handWaarden = await fetch("/src/hand-waarden.json").then(res => res.json()) as KaartConfig[]

// Haal opgeslagen ratings op
const STORAGE_KEY = "hand_ratings"
const ratings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")

// Geschiedenis van bekeken kaarten
let currentIndex = 0
const history: KaartConfig[] = []

// Kies een willekeurige kaart configuratie
function kiesWillekeurigeKaart(): KaartConfig {
    const beschikbareKaarten = handWaarden.filter(kaart => 
        !history.some(h => h.kaarten.join(",") === kaart.kaarten.join(","))
    )
    
    if (beschikbareKaarten.length === 0) {
        // Als alle kaarten zijn bekeken, reset de geschiedenis
        history.length = 0
        currentIndex = 0
        return handWaarden[Math.floor(Math.random() * handWaarden.length)]
    }
    
    return beschikbareKaarten[Math.floor(Math.random() * beschikbareKaarten.length)]
}

// Haal alle gerate kaarten op
function getRatedKaarten(): KaartConfig[] {
    return handWaarden.filter(kaart => {
        const kaartKey = kaart.kaarten.join(",")
        return ratings[kaartKey] !== undefined
    })
}

// Update de UI met een nieuwe kaart
function updateUI(kaart: KaartConfig) {
    // Update de kaart naam
    const kaartNaamEl = document.getElementById("kaart-naam")
    if (kaartNaamEl) {
        kaartNaamEl.innerHTML = kaart.kaarten.map(kaart => `<span class="kaart-naam">${kaart}</span>`).join(" <br/> ")
    }

    // Update de hand power graph
    const handPowerGraphEl = document.getElementById("hand-power-graph")
    if (handPowerGraphEl instanceof SVGElement) {
        const handPowerGraph = new HandPowerGraph(handPowerGraphEl)
        const handWaarde: HandWaarde = {
            kaarten: kaart.kaarten,
            range: kaart.range as [number, number],
            appliedToSelf: kaart.appliedToSelf,
            switchPosition: kaart.switchPosition,
            appliedToOthers: kaart.appliedToOthers,
            kansen: kaart.kansen
        }
        handPowerGraph.draw(handWaarde)
    }

    // Update de sterren
    const sterrenEl = document.getElementById("sterren")
    if (sterrenEl) {
        // Maak de sterren leeg
        sterrenEl.innerHTML = ""
        
        // Toon bestaande rating als die er is
        const kaartKey = kaart.kaarten.join(",")
        const existingRating = ratings[kaartKey]
        
        for (let i = 0; i < 10; i++) {
            const ster = document.createElement("span")
            ster.className = "ster"
            ster.textContent = "★"
            ster.dataset.index = i.toString()
            
            // Als er een bestaande rating is, toon die direct
            if (existingRating && i < existingRating) {
                ster.classList.add("actief")
            }
            
            // Hover effect
            ster.addEventListener("mouseover", () => {
                const index = parseInt(ster.dataset.index || "0")
                updateSterren(index, existingRating)
            })
            
            // Click event
            ster.addEventListener("click", () => {
                const index = parseInt(ster.dataset.index || "0")
                const rating = index + 1 // Nu 1-10 schaal
                
                // Sla de rating op
                ratings[kaartKey] = rating
                localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
                
                // Update de teller
                const ratingCounterEl = document.querySelector(".rating-counter")
                if (ratingCounterEl) {
                    const ratedCount = Object.keys(ratings).length
                    ratingCounterEl.textContent = `${ratedCount} / ${handWaarden.length}`
                }
                
                // Update de sterren weergave
                updateSterren(index, rating)
                
                // Ga automatisch naar de volgende hand
                setTimeout(() => {
                    // Kies een nieuwe kaart
                    const nieuweKaart = kiesWillekeurigeKaart()
                    history.push(nieuweKaart)
                    currentIndex = history.length - 1
                    updateUI(nieuweKaart)
                }, 500)
            })
            
            sterrenEl.appendChild(ster)
        }
    }

    // Update de navigatieknoppen en teller
    const prevButton = document.getElementById("prev-kaart") as HTMLButtonElement
    const nextButton = document.getElementById("next-kaart") as HTMLButtonElement
    const ratingPositionEl = document.querySelector(".rating-position") as HTMLElement
    
    const ratedKaarten = getRatedKaarten()
    const currentKaartKey = kaart.kaarten.join(",")
    const currentRatingIndex = ratedKaarten.findIndex(k => k.kaarten.join(",") === currentKaartKey)
    
    if (prevButton) {
        prevButton.disabled = ratedKaarten.length === 0
    }
    
    if (nextButton) {
        nextButton.disabled = currentRatingIndex === ratedKaarten.length - 1
    }
    
    if (ratingPositionEl) {
        const position = currentRatingIndex === -1 ? ratedKaarten.length + 1 : currentRatingIndex + 1
        ratingPositionEl.textContent = `${position} / ${ratedKaarten.length}`
    }
}

// Update de teller
const ratingCounterEl = document.querySelector(".rating-counter")
if (ratingCounterEl) {
    const ratedCount = Object.keys(ratings).length
    ratingCounterEl.textContent = `${ratedCount} / ${handWaarden.length}`
}

// Voeg de eerste kaart toe aan de geschiedenis
const eersteKaart = kiesWillekeurigeKaart()
history.push(eersteKaart)
updateUI(eersteKaart)

// Event listeners voor navigatie
const prevButton = document.getElementById("prev-kaart")
const nextButton = document.getElementById("next-kaart")

prevButton?.addEventListener("click", () => {
    // Haal alle gerate kaarten op
    const ratedKaarten = getRatedKaarten()
    if (ratedKaarten.length === 0) return

    // Bepaal de huidige positie in de gerate kaarten
    const currentKaartKey = history[currentIndex].kaarten.join(",")
    let currentRatingIndex = ratedKaarten.findIndex(k => k.kaarten.join(",") === currentKaartKey)
    
    // Als we bij een niet-gerate kaart zijn, ga naar de laatste gerate kaart
    if (currentRatingIndex === -1) {
        currentRatingIndex = ratedKaarten.length - 1
    } else {
        // Ga naar de vorige gerate kaart
        currentRatingIndex = Math.max(0, currentRatingIndex - 1)
    }
    
    // Update de UI met de geselecteerde kaart
    const geselecteerdeKaart = ratedKaarten[currentRatingIndex]
    currentIndex = history.findIndex(k => k.kaarten.join(",") === geselecteerdeKaart.kaarten.join(","))
    if (currentIndex === -1) {
        currentIndex = history.length
        history.push(geselecteerdeKaart)
    }
    updateUI(history[currentIndex])
})

nextButton?.addEventListener("click", () => {
    // Haal alle gerate kaarten op
    const ratedKaarten = getRatedKaarten()
    
    // Bepaal de huidige positie in de gerate kaarten
    const currentKaartKey = history[currentIndex].kaarten.join(",")
    let currentRatingIndex = ratedKaarten.findIndex(k => k.kaarten.join(",") === currentKaartKey)
    
    if (currentRatingIndex === -1) {
        // Als de huidige kaart nog niet is gerate, kies een nieuwe
        const nieuweKaart = kiesWillekeurigeKaart()
        history.push(nieuweKaart)
        currentIndex = history.length - 1
    } else if (currentRatingIndex < ratedKaarten.length - 1) {
        // Ga naar de volgende gerate kaart
        currentRatingIndex++
        const volgendeKaart = ratedKaarten[currentRatingIndex]
        currentIndex = history.findIndex(k => k.kaarten.join(",") === volgendeKaart.kaarten.join(","))
        if (currentIndex === -1) {
            currentIndex = history.length
            history.push(volgendeKaart)
        }
    }
    updateUI(history[currentIndex])
})

// Update de sterren weergave
function updateSterren(hoverIndex: number, selectedRating?: number) {
    const sterren = document.querySelectorAll(".ster")
    sterren.forEach((ster, index) => {
        if (selectedRating !== undefined && index < selectedRating) {
            // Als er een geselecteerde rating is, toon die
            ster.classList.add("actief")
            ster.classList.remove("half")
        } else if (index <= hoverIndex) {
            // Anders toon de hover state
            ster.classList.add("actief")
            ster.classList.remove("half")
        } else {
            ster.classList.remove("actief", "half")
        }
    })
}

// Reset sterren bij mouseleave
const sterrenEl = document.getElementById("sterren")
sterrenEl?.addEventListener("mouseleave", () => {
    const kaartKey = history[currentIndex].kaarten.join(",")
    const selectedRating = ratings[kaartKey]
    updateSterren(-1, selectedRating)
}) 