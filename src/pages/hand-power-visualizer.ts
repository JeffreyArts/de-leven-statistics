import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power-visualizer.scss"
import {Card, CardTypes} from "./../models/card"
import berekenHandwaarde from "../utilities/bereken-worp"

const hand = [] as Array<Card>
const throws = [] as number[]

for(let i = 0; i < CardTypes.length; i++) {
    // const index =i
    hand.push(new Card(CardTypes[i]))
}


const selectCard = function(event: Event) {
    const buttonEl = event.target as HTMLButtonElement
    if (!buttonEl) {
        return
    }

    const targetRow = buttonEl.parentElement?.parentElement
    if (!targetRow) {
        return
    }

    if (buttonEl.innerHTML === "-") {
        buttonEl.innerHTML = "+"
        targetRow.classList.remove("selected")
    } else {
        buttonEl.innerHTML = "-"
        targetRow.classList.add("selected")
    }
    const card = hand.find(card => `card-${card.id}` ===  targetRow.id)
    if (card) {
        card.selected = !card.selected
    }
    // console.log(card)
}


// add cards from hand to #table
const table = document.querySelector("#hand-overview tbody")
if (table) {
    hand.forEach(card => {
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        const tdDescr = document.createElement("td")
        const tdButton = document.createElement("td")
        const button = document.createElement("button")
    
        table.appendChild(tr)
        tr.appendChild(tdName)
        tr.appendChild(tdDescr)
        tr.appendChild(tdButton)
        tdButton.appendChild(button)
    
        tdName.innerHTML = card.name
        tdDescr.innerHTML = card.description
    
        button.innerHTML = "+"  
        button.classList.add("addition-button")
        button.addEventListener("click", selectCard)
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
        const res = berekenHandwaarde(hand.filter(card => card.selected))
        throws.push(...res)
        updateDiceResult()
        drawChart(throws) 
    })
}

const werp10El = document.querySelector("#werp-10")
if (werp10El) {
    werp10El.addEventListener("click", function() { 
        const res = berekenHandwaarde(hand.filter(card => card.selected), 10)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp100El = document.querySelector("#werp-100")
if (werp100El) {
    werp100El.addEventListener("click", function() { 
        const res = berekenHandwaarde(hand.filter(card => card.selected), 100)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp1000El = document.querySelector("#werp-1000")
if (werp1000El) {
    werp1000El.addEventListener("click", function() { 
        const res = berekenHandwaarde(hand.filter(card => card.selected), 1000)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp100000El = document.querySelector("#werp-100000")
if (werp100000El) {
    werp100000El.addEventListener("click", function() { 
        const res = berekenHandwaarde(hand.filter(card => card.selected), 100000)
        throws.push(...res)
        updateDiceResult()
        drawChart(throws)
    })
}

const werp1000000El = document.querySelector("#werp-1000000")
if (werp1000000El) {
    werp1000000El.addEventListener("click", function() { 
        // Bereken in batches van 100.000
        for (let i = 0; i < 10; i++) {
            const res = berekenHandwaarde(hand.filter(card => card.selected), 100000)
            throws.push(...res)
            updateDiceResult()
            drawChart(throws)
        }
    })
}

const updateDiceResult = function() {
    const dicesEl = document.querySelector("#dices") as HTMLElement
    const diceResultEl = document.querySelector("#dice-result") as HTMLElement
    
    if (diceResultEl) {
        diceResultEl.innerHTML = throws[throws.length - 1].toString()
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

    if (throws.length > 0) {
        const kansenLijstEl = document.querySelector("#kansen-lijst")
        if (kansenLijstEl) {
            // Bereken de frequentie van elke waarde
            const frequenties = throws.reduce((acc, num) => {
                acc[num] = (acc[num] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            // Maak de lijst leeg
            kansenLijstEl.innerHTML = ""

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

