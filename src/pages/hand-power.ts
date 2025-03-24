import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power.scss"
import {Card, CardTypes} from "./../models/card"

interface HandWaarde {
    kaarten: string[];
    range: [number, number];
    appliedToSelf: boolean;
    switchPosition: boolean;
    appliedToOthers: number;
    kansen: Array<{
        waarde: number;
        percentage: number;
    }>;
}

const hand = [] as Array<Card>
const handWaarden = (await import("../hand-waarden.json")).default as HandWaarde[]

for(let i = 0; i < CardTypes.length; i++) {
    hand.push(new Card(CardTypes[i]))
}

const selectCard = function(event: Event) {
    const targetEl = event.target as HTMLElement
    if (!targetEl) {
        return
    }

    const targetRow = targetEl.closest("tr")
    if (!targetRow) {
        return
    }

    const buttonEl = targetRow.querySelector("button")
    if (!buttonEl) {
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
        updateHandWaarden()
    }
}

function updateHandWaarden() {
    const selectedCards = hand.filter(card => card.selected)
    const selectedCardNames = selectedCards.map(card => card.name)
    
    // Zoek de hand-waarden die overeenkomen met de geselecteerde kaarten
    const matchingHand = handWaarden.find((hand: HandWaarde) => {
        return hand.kaarten.length === selectedCardNames.length &&
               hand.kaarten.every((kaart: string, index: number) => kaart === selectedCardNames[index])
    })

    if (matchingHand) {
        console.log("Gevonden hand-waarden:", matchingHand)
        drawChart(matchingHand)
    }
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
        tr.addEventListener("click", selectCard)
        tr.id = `card-${card.id}`
        card.tr = tr
    })
}

function drawChart(matchingHand?: HandWaarde) {
    const svg = document.getElementById("chart")
    if (!svg || !(svg instanceof SVGElement)) {
        return
    }
    svg.innerHTML = "" // Clear previous chart
    
    const width = 100
    const height = 50
    const lineLength = 78
    const startX = (width - lineLength) / 2 // Centreer de lijnen horizontaal
    
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)

    // Teken drie rechte lijnen
    for (let i = 0; i < 3; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttribute("x1", startX.toString())
        line.setAttribute("x2", (startX + lineLength).toString())
        line.setAttribute("y1", (height/2 + (i-1)*15).toString())
        line.setAttribute("y2", (height/2 + (i-1)*15).toString())
        line.setAttribute("stroke", "#ccc")
        line.setAttribute("stroke-width", "0.32")
        svg.appendChild(line)
    }

    // Teken verticale streepjes en cijfers
    for (let x = 0; x <= lineLength; x += 6) {
        const xPos = startX + x
        // Verticale streep
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
        tick.setAttribute("x1", xPos.toString())
        tick.setAttribute("x2", xPos.toString())
        tick.setAttribute("y1", (height/2 - 20).toString())
        tick.setAttribute("y2", (height/2 + 20).toString())
        tick.setAttribute("stroke", "#ccc")
        tick.setAttribute("stroke-width", ".16")
        svg.appendChild(tick)

        // Cijfer
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", xPos.toString())
        text.setAttribute("y", (height/2 + 23).toString())
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("fill", "#ccc")
        text.setAttribute("font-size", "2")
        text.textContent = x.toString()
        svg.appendChild(text)
    }

    // Teken drie balletjes
    const playerColors = ["#90f", "#f09", "#0f9"]
    const playerNames = ["Speler links", "Jij", "Speler rechts"]
    for (let i = 0; i < 3; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute("cx", startX.toString())
        circle.setAttribute("cy", `${height/2 + (i-1)*15}`)
        circle.setAttribute("r", "1.6")
        circle.setAttribute("fill", playerColors[i])
        svg.appendChild(circle)

        // Voeg speler naam toe
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", startX.toString())
        text.setAttribute("y", `${height/2 + (i-1)*15 - 5}`)
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("fill", playerColors[i])
        text.setAttribute("font-size", "2")
        text.textContent = playerNames[i]
        svg.appendChild(text)
    }

    // Teken de range voor de juiste spelers
    if (matchingHand) {
        console.log("Matching hand:", matchingHand)
        const { appliedToSelf, appliedToOthers, kansen, range } = matchingHand
        
        // Bereken de maximale kans voor deze specifieke hand
        const maxPercentage = Math.max(...kansen.map(k => k.percentage))
        
        // Bereken de schaal voor de dikte van de range
        // Gebruik een logaritmische schaling voor betere visualisatie
        const scale = 5 / Math.log10(maxPercentage + 1)
        
        // Teken range voor speler 2 (jij) als appliedToSelf true is
        if (appliedToSelf) {
            drawRangeCurve(svg, kansen, height/2, playerColors[1], startX, lineLength, scale, range)
        }
        
        // Teken range voor speler links als appliedToOthers 1 of 2 is
        if (appliedToOthers >= 1) {
            drawRangeCurve(svg, kansen, height/2 - 15, playerColors[0], startX, lineLength, scale, range)
        }
        
        // Teken range voor speler rechts als appliedToOthers 1 of 2 is
        if (appliedToOthers >= 1) {
            drawRangeCurve(svg, kansen, height/2 + 15, playerColors[2], startX, lineLength, scale, range)
        }
    }
}

function drawRangeCurve(
    svg: SVGElement,
    kansen: Array<{ waarde: number; percentage: number }>,
    y: number,
    color: string,
    startX: number,
    lineLength: number,
    scale: number,
    range: [number, number]
) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    
    // Bereken de x-posities voor het begin en einde van de range
    const rangeStartX = startX + range[0]
    const rangeEndX = startX + range[1]
    
    // Begin het pad bij het begin van de range
    let d = `M ${rangeStartX} ${y}`
    
    // Sorteer de kansen op waarde voor een vloeiende lijn
    const sortedKansen = [...kansen].sort((a, b) => a.waarde - b.waarde)
    
    // Filter kansen binnen de range en teken de lijn als een polygon
    const filteredKansen = sortedKansen.filter(kans => kans.waarde >= range[0] && kans.waarde <= range[1])
    
    for (let index = 0; index < filteredKansen.length; index++) {
        const kans = filteredKansen[index]
        const x = startX + kans.waarde
        // Gebruik een logaritmische schaling voor de dikte met een minimum van 1
        const thickness = Math.max(.1, Math.log10(kans.percentage + 1) * scale)
        
        if (index === 0) {
            d += ` L ${x} ${y - thickness}`
        } else {
            d += ` ${x} ${y - thickness}`
        }
    }

    for (let index = filteredKansen.length - 1; index >= 0; index--) {
        const kans = filteredKansen[index]
        const x = startX + kans.waarde
        // Gebruik een logaritmische schaling voor de dikte met een minimum van 1
        const thickness = Math.max(.1, Math.log10(kans.percentage + 1) * scale)
        
        if (index === 0) {
            d += ` L ${x} ${y + thickness}`
        } else {
            d += ` ${x} ${y + thickness}`
        }
    }
    
    // Sluit het pad
    d += ` L ${rangeStartX} ${y} L ${rangeStartX} ${y} Z`
    
    path.setAttribute("d", d)
    path.setAttribute("fill", color)
    path.setAttribute("stroke", "none")
    path.setAttribute("opacity", "0.8")
    svg.appendChild(path)
}

drawChart() 