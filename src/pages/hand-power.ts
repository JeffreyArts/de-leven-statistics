import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power.scss"
import {Card, CardName, CardTypes} from "./../models/card"
import { HandPowerGraph, HandWaarde } from "../components/hand-power-graph"

const hand = [] as Array<Card>
const selectedCards = new Map<string, number>() // Houdt bij hoeveel van elke kaart is geselecteerd
const handWaarden = (await import("../hand-waarden.json")).default as HandWaarde[]
const MAX_SELECTED_CARDS = 5

for(let i = 0; i < CardTypes.length; i++) {
    hand.push(new Card(CardTypes[i]))
}

const chartElement = document.getElementById("chart")
if (!chartElement || !(chartElement instanceof SVGElement)) {
    throw new Error("Chart element not found")
}

const handPowerGraph = new HandPowerGraph(chartElement)

function updateHandWaarden() {
    // Converteer de selectedCards Map naar een array van kaartnamen
    const selectedCardNames: CardName[] = []
    selectedCards.forEach((count, cardName) => {
        for (let i = 0; i < count; i++) {
            selectedCardNames.push(cardName as CardName)
        }
    })
    
    // Zoek de hand-waarden die overeenkomen met de geselecteerde kaarten
    const matchingHand = handWaarden.find((hand: HandWaarde) => {
        return hand.kaarten.length === selectedCardNames.length &&
               hand.kaarten.every((kaart: string, index: number) => kaart === selectedCardNames[index])
    })

    if (matchingHand) {
        console.log("Gevonden hand-waarden:", matchingHand)
        handPowerGraph.draw(matchingHand)
    } else {
        handPowerGraph.draw()
    }
}

function updateSelectedCount() {
    // Update de teller voor elke kaart
    hand.forEach(card => {
        if (card.tr) {
            const countEl = card.tr.querySelector("td:nth-child(3)")
            if (countEl) {
                const count = selectedCards.get(card.name) || 0
                countEl.innerHTML = count.toString()
            }
        }
    })
}

// add cards from hand to #table
const table = document.querySelector("#hand-overview tbody")
if (table) {
    hand.forEach(card => {
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        const tdDescr = document.createElement("td")
        const tdCount = document.createElement("td")
        const tdButton = document.createElement("td")
        const buttonContainer = document.createElement("div")
        const plusButton = document.createElement("button")
        const minusButton = document.createElement("button")
    
        table.appendChild(tr)
        tr.appendChild(tdName)
        tr.appendChild(tdDescr)
        tr.appendChild(tdCount)
        tr.appendChild(tdButton)
        tdButton.appendChild(buttonContainer)
        buttonContainer.appendChild(plusButton)
        buttonContainer.appendChild(minusButton)
    
        tdName.innerHTML = card.name
        tdDescr.innerHTML = card.description
        tdCount.innerHTML = "0"
    
        plusButton.innerHTML = "+"
        minusButton.innerHTML = "-"
        
        plusButton.classList.add("addition-button", "plus-btn")
        minusButton.classList.add("addition-button", "minus-btn", "__isDisabled")
        
        plusButton.addEventListener("click", () => {
            const totalSelected = Array.from(selectedCards.values()).reduce((a, b) => a + b, 0)
            if (totalSelected < MAX_SELECTED_CARDS) {
                // Voeg kaart toe aan geselecteerde kaarten
                const currentCount = selectedCards.get(card.name) || 0
                selectedCards.set(card.name, currentCount + 1)
                
                minusButton.classList.remove("__isDisabled")
                updateSelectedCount()
                updateHandWaarden()
                
                // Alleen de plus knoppen uitschakelen als we het maximum bereiken
                if (totalSelected + 1 >= MAX_SELECTED_CARDS) {
                    hand.forEach(c => {
                        if (c.tr) {
                            const plusBtn = c.tr.querySelector(".plus-btn")
                            if (plusBtn && !c.selected) {
                                plusBtn.classList.add("__isDisabled")
                            }
                        }
                    })
                }
            }
        })
        
        minusButton.addEventListener("click", () => {
            // Verwijder kaart van geselecteerde kaarten
            const currentCount = selectedCards.get(card.name) || 0
            if (currentCount > 0) {
                selectedCards.set(card.name, currentCount - 1)
                if (currentCount - 1 === 0) {
                    minusButton.classList.add("__isDisabled")
                }
            }
            
            // Plus knoppen weer inschakelen als we onder het maximum komen
            const totalSelected = Array.from(selectedCards.values()).reduce((a, b) => a + b, 0)
            if (totalSelected < MAX_SELECTED_CARDS) {
                hand.forEach(c => {
                    if (c.tr) {
                        const plusBtn = c.tr.querySelector(".plus-btn")
                        if (plusBtn) {
                            plusBtn.classList.remove("__isDisabled")
                        }
                    }
                })
            }
            
            updateSelectedCount()
            updateHandWaarden()
        })
        
        tr.id = `card-${card.id}`
        card.tr = tr
    })
}

// Initial draw
handPowerGraph.draw() 