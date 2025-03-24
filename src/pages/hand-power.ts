import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power.scss"
import {Card, CardName, CardTypes} from "./../models/card"

interface HandWaarde {
    kaarten: CardName[];
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
const selectedCards = new Map<string, number>() // Houdt bij hoeveel van elke kaart is geselecteerd
const handWaarden = (await import("../hand-waarden.json")).default as HandWaarde[]
const MAX_SELECTED_CARDS = 5

for(let i = 0; i < CardTypes.length; i++) {
    hand.push(new Card(CardTypes[i]))
}

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
        return drawChart(matchingHand)
    }
    drawChart()
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

    let appliedToSelf = true
    let appliedToOthers = 0
    let range: [number, number] = [1, 6]
    let kaarten = [] as CardName[]
    let kansen = [
        {
            "waarde": 1,
            "percentage": 16
        },
        {
            "waarde": 2,
            "percentage": 16
        },
        {
            "waarde": 3,
            "percentage": 16
        },
        {
            "waarde": 4,
            "percentage": 16
        },
        {
            "waarde": 5,
            "percentage": 16
        },
        {
            "waarde": 6,
            "percentage": 16
        }
    ]

    
    
    if (matchingHand) {
        ({ appliedToSelf, appliedToOthers, kansen, range, kaarten } = matchingHand)
    }
    // Teken de range voor de juiste spelers
        
    // Bereken de maximale kans voor deze specifieke hand
    const maxPercentage = Math.max(...kansen.map(k => k.percentage))
        
    // Bereken de schaal voor de dikte van de range
    // Gebruik een logaritmische schaling voor betere visualisatie
    const scale = 5 / Math.log10(maxPercentage + 1)
    // Teken range voor speler 2 (jij) als appliedToSelf true is
    if (appliedToSelf) {
        console.log("appliedToSelf", appliedToSelf)
        drawRangeCurve(svg, kansen, 1, startX, scale, range)
    }
        
    console.log("kaarten", kaarten)
    // Teken range voor speler links als appliedToOthers 1 of 2 is
    if (appliedToOthers == 1) {
        if (kaarten.includes("Speler links")) {
            drawRangeCurve(svg, kansen, 0, startX, scale, range)
        }
        if (kaarten.includes("Speler rechts")) {
            drawRangeCurve(svg, kansen, 2, startX, scale, range)
        }
    }
        
    // Teken range voor speler rechts als appliedToOthers 1 of 2 is
    if (appliedToOthers >= 2) {
        drawRangeCurve(svg, kansen, 0, startX, scale, range)
        drawRangeCurve(svg, kansen, 2, startX, scale, range)
    }
    
}

function drawRangeCurve(
    svg: SVGElement,
    kansen: Array<{ waarde: number; percentage: number }>,
    spelerIndex: number,
    startX: number,
    scale: number,
    range: [number, number]
) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    const height = 50
    const y = height/2 + (spelerIndex-1)*15
    const playerColors = ["#90f", "#f09", "#0f9"]
    const color = playerColors[spelerIndex]
    
    // Bereken de x-posities voor het begin en einde van de range
    const rangeStartX = startX + range[0]
    
    
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