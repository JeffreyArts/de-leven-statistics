import "/src/scss/style.scss"
import "/src/scss/kaart-rating.scss"
import { HandPowerGraph, HandWaarde } from "../components/hand-power-graph"
import { CardName } from "../models/card"
import * as tf from "@tensorflow/tfjs"

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

// ML Model
let model: tf.LayersModel | null = null

// Geschiedenis van bekeken kaarten
let currentIndex = 0
const trainingHistory: KaartConfig[] = []

// Kies een willekeurige kaart configuratie
function kiesWillekeurigeKaart(): KaartConfig {
    const beschikbareKaarten = handWaarden.filter(kaart => 
        !trainingHistory.some(h => h.kaarten.join(",") === kaart.kaarten.join(","))
    )
    
    if (beschikbareKaarten.length === 0) {
        // Als alle kaarten zijn bekeken, reset de geschiedenis
        trainingHistory.length = 0
        currentIndex = 0
        return handWaarden[Math.floor(Math.random() * handWaarden.length)]
    }
    
    return beschikbareKaarten[Math.floor(Math.random() * beschikbareKaarten.length)]
}

// Haal alle gerate kaarten op
function getRatedKaarten(): KaartConfig[] {
    return Object.keys(ratings).map(kaartKey => {
        return handWaarden.find(kaart => kaart.kaarten.join(",") === kaartKey)!
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
                    trainingHistory.push(nieuweKaart)
                    currentIndex = trainingHistory.length - 1
                    updateUI(nieuweKaart)
                }, 100)
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

    // Update voorspelling als model bestaat
    if (model) {
        updatePrediction()
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
trainingHistory.push(eersteKaart)
updateUI(eersteKaart)

// Event listeners voor navigatie
const prevButton = document.getElementById("prev-kaart")
const nextButton = document.getElementById("next-kaart")

prevButton?.addEventListener("click", () => {
    // Haal alle gerate kaarten op
    const ratedKaarten = getRatedKaarten()
    if (ratedKaarten.length === 0) return

    // Bepaal de huidige positie in de gerate kaarten
    const currentKaartKey = trainingHistory[currentIndex].kaarten.join(",")
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
    currentIndex = trainingHistory.findIndex(k => k.kaarten.join(",") === geselecteerdeKaart.kaarten.join(","))
    if (currentIndex === -1) {
        currentIndex = trainingHistory.length
        trainingHistory.push(geselecteerdeKaart)
    }
    updateUI(trainingHistory[currentIndex])
})

nextButton?.addEventListener("click", () => {
    // Haal alle gerate kaarten op
    const ratedKaarten = getRatedKaarten()
    
    // Bepaal de huidige positie in de gerate kaarten
    const currentKaartKey = trainingHistory[currentIndex].kaarten.join(",")
    let currentRatingIndex = ratedKaarten.findIndex(k => k.kaarten.join(",") === currentKaartKey)
    
    if (currentRatingIndex === -1) {
        // Als de huidige kaart nog niet is gerate, kies een nieuwe
        const nieuweKaart = kiesWillekeurigeKaart()
        trainingHistory.push(nieuweKaart)
        currentIndex = trainingHistory.length - 1
    } else if (currentRatingIndex < ratedKaarten.length - 1) {
        // Ga naar de volgende gerate kaart
        currentRatingIndex++
        const volgendeKaart = ratedKaarten[currentRatingIndex]
        currentIndex = trainingHistory.findIndex(k => k.kaarten.join(",") === volgendeKaart.kaarten.join(","))
        if (currentIndex === -1) {
            currentIndex = trainingHistory.length
            trainingHistory.push(volgendeKaart)
        }
    }
    updateUI(trainingHistory[currentIndex])
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
    const kaartKey = trainingHistory[currentIndex].kaarten.join(",")
    const selectedRating = ratings[kaartKey]
    updateSterren(-1, selectedRating)
})

// ML Model functionaliteit
// Verwijder de model declaratie hier
// let model: tf.LayersModel | null = null

// Functie om de data voor te bereiden
function prepareData(ratings: Record<string, number>, handWaarden: KaartConfig[]) {
    const features: number[][] = []
    const labels: number[] = []
    
    if (Object.keys(ratings).length === 0) {
        throw new Error("Er zijn nog geen kaarten gerate")
    }
    
    for (const [kaartKey, rating] of Object.entries(ratings)) {
        const kaart = handWaarden.find(k => k.kaarten.join(",") === kaartKey)
        if (!kaart) {
            console.warn(`Kaart niet gevonden voor key: ${kaartKey}`)
            continue
        }
        
        try {
            // Gebruik alleen de relevante features
            const feature = [
                ...kaart.range,
                kaart.appliedToSelf ? 1 : 0,
                kaart.switchPosition ? 1 : 0,
                kaart.appliedToOthers
            ]
            
            features.push(feature)
            labels.push(rating / 10)
        } catch (error) {
            console.error(`Fout bij verwerken van kaart ${kaartKey}:`, error)
        }
    }
    
    if (features.length === 0) {
        throw new Error("Geen geldige features gevonden voor het trainen")
    }
    
    return {
        features: tf.tensor2d(features),
        labels: tf.tensor1d(labels)
    }
}

// Maak en train het model
async function trainModel(ratings: Record<string, number>, handWaarden: KaartConfig[]) {
    const statusEl = document.getElementById("model-status")
    const trainButton = document.getElementById("train-model") as HTMLButtonElement
    const accuracyEl = document.getElementById("model-accuracy")
    
    if (!statusEl || !trainButton || !accuracyEl) return
    
    statusEl.textContent = "Model wordt getraind..."
    trainButton.disabled = true
    
    try {
        const {features, labels} = prepareData(ratings, handWaarden)
        
        // Maak een sequentieel model
        model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [features.shape[1]],
                    units: 32,
                    activation: "relu"
                }),
                tf.layers.dense({
                    units: 16,
                    activation: "relu"
                }),
                tf.layers.dense({
                    units: 1,
                    activation: "sigmoid"
                })
            ]
        })
        
        // Compileer het model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: "meanSquaredError",
            metrics: ["mse"]
        })
        
        // Train het model
        const trainingHistory = await model.fit(features, labels, {
            epochs: 100,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
                        const accuracy = (1 - logs.mse) * 100
                        accuracyEl.textContent = `${accuracy.toFixed(1)}%`
                    }
                }
            }
        })
        
        statusEl.textContent = "Model getraind!"
        
        // Update voorspelling voor huidige kaart
        updatePrediction()
        
    } catch (error) {
        statusEl.textContent = "Fout bij trainen model"
        console.error(error)
    } finally {
        trainButton.disabled = false
    }
}

// Update voorspelling voor huidige kaart
function updatePrediction() {
    if (!model) return
    
    const predictionEl = document.getElementById("predicted-rating")
    if (!predictionEl) return
    
    const currentKaart = trainingHistory[currentIndex]
    
    // Gebruik alleen de relevante features
    const feature = [
        ...currentKaart.range,
        currentKaart.appliedToSelf ? 1 : 0,
        currentKaart.switchPosition ? 1 : 0,
        currentKaart.appliedToOthers
    ]
    
    const prediction = model.predict(tf.tensor2d([feature])) as tf.Tensor
    const predictedRating = prediction.dataSync()[0] * 10
    predictionEl.textContent = predictedRating.toFixed(1)
}

// Event listener voor train knop
const trainButton = document.getElementById("train-model")
trainButton?.addEventListener("click", () => {
    if (Object.keys(ratings).length < 10) {
        alert("Je hebt minimaal 10 ratings nodig om het model te trainen!")
        return
    }
    trainModel(ratings, handWaarden)
}) 