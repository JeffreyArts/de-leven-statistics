import "/src/scss/style.scss"
import "/src/scss/buttons.scss"
import "/src/scss/hand-power.scss"
import {Card, CardTypes} from "./../models/card"

const hand = [] as Array<Card>

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

function drawChart() {
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
        // Verticale streep
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
        tick.setAttribute("x1", (startX + x).toString())
        tick.setAttribute("x2", (startX + x).toString())
        tick.setAttribute("y1", (height/2 - 20).toString())
        tick.setAttribute("y2", (height/2 + 20).toString())
        tick.setAttribute("stroke", "#ccc")
        tick.setAttribute("stroke-width", ".16")
        svg.appendChild(tick)

        // Cijfer
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", (startX + x).toString())
        text.setAttribute("y", (height/2 + 23).toString())
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("fill", "#ccc")
        text.setAttribute("font-size", "2")
        text.textContent = x.toString()
        svg.appendChild(text)
    }

    // Teken drie balletjes
    const ballColors = ["#90f", "#f09", "#0f9"]
    for (let i = 0; i < 3; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute("cx", startX.toString())
        circle.setAttribute("cy", `${height/2 + (i-1)*15}`)
        circle.setAttribute("r", "1.6")
        circle.setAttribute("fill", ballColors[i])
        svg.appendChild(circle)
    }
}

drawChart() 