import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power-visualizer.scss"
import {Card, CardTypes} from "./../models/card"
import berekenHandwaarde from "../utilities/bereken-worp"

const hand = [] as Array<Card>
const throws = [] as number[]
const selectedCards = new Map<string, number>() // Houdt bij hoeveel van elke kaart is geselecteerd
const MAX_SELECTED_CARDS = 5

for(let i = 0; i < CardTypes.length; i++) {
    hand.push(new Card(CardTypes[i]))
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
        buttonContainer.classList.add("button-container")
    
        tdName.innerHTML = card.name
        tdDescr.innerHTML = card.description
        tdCount.innerHTML = "0"
        tdCount.className = "card-count"
    
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
        })
        
        tr.id = `card-${card.id}`
        card.tr = tr
    })
}

const gameboardEl = document.querySelector("#gameboard")
if (gameboardEl) {
    for (let i = 0; i < 76; i++) {
        const field = document.createElement("div")
        field.classList.add("field")
        field.innerHTML = (i+1).toString()
        gameboardEl.appendChild(field)
    }
}

const werp1El = document.querySelector("#werp")
if (werp1El) {
    werp1El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        const res = berekenHandwaarde(selectedCardsArray)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws) 
    })
}

const werp10El = document.querySelector("#werp-10")
if (werp10El) {
    werp10El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        const res = berekenHandwaarde(selectedCardsArray, 10)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp100El = document.querySelector("#werp-100")
if (werp100El) {
    werp100El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        const res = berekenHandwaarde(selectedCardsArray, 100)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp1000El = document.querySelector("#werp-1000")
if (werp1000El) {
    werp1000El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        const res = berekenHandwaarde(selectedCardsArray, 1000)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp100000El = document.querySelector("#werp-100000")
if (werp100000El) {
    werp100000El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        const res = berekenHandwaarde(selectedCardsArray, 100000)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp1000000El = document.querySelector("#werp-1000000")
if (werp1000000El) {
    werp1000000El.addEventListener("click", function() { 
        const selectedCardsArray = [] as Card[]
        selectedCards.forEach((count, cardName) => {
            const card = hand.find(c => c.name === cardName)
            if (card) {
                for (let i = 0; i < count; i++) {
                    selectedCardsArray.push(card)
                }
            }
        })
        // Bereken in batches van 100.000
        for (let i = 0; i < 10; i++) {
            const res = berekenHandwaarde(selectedCardsArray, 100000)
            throws.push(...res)
            updateDiceResult()
            drawChart(throws)
        }
    })
}

const resetDicesEl = document.querySelector("#reset-dices")
if (resetDicesEl) {
    resetDicesEl.addEventListener("click", function() {
        throws.length = 0
        selectedCards.clear() // Reset de selectedCards Map
        hand.forEach(card => {
            if (card.tr) {
                const countEl = card.tr.querySelector("td:nth-child(3)")
                if (countEl) {
                    countEl.innerHTML = "0"
                }
                const minusBtn = card.tr.querySelector(".minus-btn")
                if (minusBtn) {
                    minusBtn.classList.add("__isDisabled")
                }
                const plusBtn = card.tr.querySelector(".plus-btn")
                if (plusBtn) {
                    plusBtn.classList.remove("__isDisabled")
                }
            }
        })
        updateDiceResult()
        drawChart(throws)
    })
}

const updateDiceResult = function() {
    const dicesEl = document.querySelector("#dices") as HTMLElement
    const diceResultEl = document.querySelector("#dice-result") as HTMLElement
    
    if (diceResultEl) {
        diceResultEl.innerHTML = throws.length > 0 ? throws[throws.length - 1].toString() : "-"
        // Gebruik de font-size van de laatste worp als basis
        const baseFontSize = window.getComputedStyle(diceResultEl).fontSize
        if (dicesEl) {
            const aantalDobbelstenen = throws.length.toString()
            dicesEl.innerHTML = aantalDobbelstenen
            
            // Pas de font-size aan op basis van de lengte van het getal
            if (aantalDobbelstenen.length > 5) {
                dicesEl.style.fontSize = `calc(${baseFontSize} * 0.8)`
            } else {
                dicesEl.style.fontSize = baseFontSize
            }
        }
    }

    const kansenLijstEl = document.querySelector("#kansen-lijst")
    if (kansenLijstEl) {
        // Maak de lijst leeg
        kansenLijstEl.innerHTML = ""

        if (throws.length > 0) {
            // Bereken de frequentie van elke waarde
            const frequenties = throws.reduce((acc, num) => {
                acc[num] = (acc[num] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            // Maak een tabel
            const table = document.createElement("table")
            const thead = document.createElement("thead")
            const tbody = document.createElement("tbody")
            
            // Voeg de header toe
            const headerRow = document.createElement("tr")
            headerRow.innerHTML = `
                <th>Waarde</th>
                <th>Percentage</th>
                <th>Aantal</th>
            `
            thead.appendChild(headerRow)
            table.appendChild(thead)
            table.appendChild(tbody)

            // Voeg elke kans toe aan de tabel
            Object.entries(frequenties)
                .map(([waarde, aantal]) => ({
                    waarde: parseInt(waarde),
                    aantal,
                    percentage: (aantal / throws.length) * 100
                }))
                .sort((a, b) => b.percentage - a.percentage)
                .forEach(({waarde, aantal, percentage}) => {
                    const tr = document.createElement("tr")
                    tr.innerHTML = `
                        <td>${waarde}</td>
                        <td>${percentage.toFixed(1)}%</td>
                        <td>${aantal}x</td>
                    `
                    tbody.appendChild(tr)
                })

            kansenLijstEl.appendChild(table)
        }
    }
}

function drawChart(input: number[]) {
    // Create an array with a length equal to the maximum number in the input
    const maxValue = input.reduce((max, num) => Math.max(max, num), 0)
    const data = Array.from({ length: maxValue }, (_, i) => i + 1).reduce((acc, num) => {
        acc[num] = 0 // Initialize all numbers to 0 frequency
        return acc
    }, {} as Record<number, number>)

    // Count frequencies in the input
    input.forEach(num => {
        data[num] = (data[num] || 0) + 1
    })

    // Get SVG element and set viewBox dimensions dynamically
    const svg = document.getElementById("chart")
    if (!svg || !(svg instanceof SVGElement)) {
        return
    }
    svg.innerHTML = "" // Clear previous chart
    const barWidth = 40
    const barGap = 20
    const numBars = Object.keys(data).length
    const chartWidth = numBars * (barWidth + barGap) + barGap // Total width based on bars and gaps
    const chartHeight = 400 // Fixed height for simplicity

    // Set the viewBox attribute
    svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight + 20}`) // Extra space for labels

    const maxFrequency = Object.values(data).reduce((max, freq) => Math.max(max, freq), 0)
    const scale = chartHeight / (maxFrequency + 1)

    let xOffset = barGap

    Object.entries(data).forEach(([num, freq]) => {
        // Draw bar
        const barHeight = freq * scale
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        rect.setAttribute("class", "bar")
        rect.setAttribute("x", xOffset.toString())
        rect.setAttribute("y", (chartHeight - barHeight).toString())
        rect.setAttribute("width", barWidth.toString())
        rect.setAttribute("height", barHeight.toString())
        svg.appendChild(rect)

        // Add number label underneath each bar
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text")
        label.setAttribute("class", "label")
        label.setAttribute("x", (xOffset + barWidth / 2).toString())
        label.setAttribute("y", (chartHeight + 15).toString()) // Position the label below the chart
        label.textContent = num
        label.setAttribute("text-anchor", "middle")
        svg.appendChild(label)

        xOffset += barWidth + barGap
    })
}

