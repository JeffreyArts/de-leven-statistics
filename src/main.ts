import "./scss/style.scss"
import {Card, CardTypes} from "./models/card"

const hand = [] as Card[]
let dice = 1
let diceResult = 0
const throws = [] as number[]

for(let i = 0; i < CardTypes.length; i++) {
    // const index =i
    hand.push(new Card(CardTypes[i]))
}


const selectCard = function(event: Event) {
    const buttonEl = event.target as buttonElement
    if (!buttonEl) {
        return
    }

    const targetRow = buttonEl.parentElement?.parentElement

    if (buttonEl.innerHTML === "-") {
        buttonEl.innerHTML = "+"
        targetRow.classList.remove("selected")
    } else {
        buttonEl.innerHTML = "-"
        targetRow.classList.add("selected")
    }
    const card = hand.find(card => `card-${card.id}` ===  targetRow.id)
    card.selected = !card.selected
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

const werp = function() {

    const activeCards = hand.filter(card => card.selected)
    dice = 1
    let doubleThrow = false
    let bestOf3 = false

    // Proces extra dobbelsteen
    activeCards.forEach(card => {  
        if (card.name == "Extra dobbelsteen") {
            dice ++
        }
        if (card.name == "Meerdere dobbelstenen") {
            dice = Math.ceil(Math.random() * 6)
        }
        if (card.name == "Dubbele worp") {
            doubleThrow = true
        }
        if (card.name == "Best of 3") {
            bestOf3 = true
        }
    })
    diceResult = 0
    diceResult = calculateThrow(doubleThrow, 0)
    if (bestOf3) {
        const poging2 = calculateThrow(doubleThrow, 0)
        const poging3 = calculateThrow(doubleThrow, 0)

        if (poging2 > diceResult) {
            diceResult = poging2
        }
        if (poging3 > diceResult) {
            diceResult = poging3
        }
    }
    throws.push(diceResult)

    updateDiceResult()
}

const werp1El = document.querySelector("#werp")
if (werp1El) {
    werp1El.addEventListener("click", function() { werp(); drawChart(throws) })
}
const werp10El = document.querySelector("#werp-10")
if (werp10El) {
    werp10El.addEventListener("click", function() { 
        for (let i = 0; i < 10; i++) {
            werp() 
        }
        drawChart(throws)
    })
}
const werp100El = document.querySelector("#werp-100")
if (werp100El) {
    werp100El.addEventListener("click", function() { 
        for (let i = 0; i < 100; i++) {
            werp() 
        }
        drawChart(throws)
    })
}

const werp1000El = document.querySelector("#werp-1000")
if (werp1000El) {
    werp1000El.addEventListener("click", function() { 
        for (let i = 0; i < 1000; i++) {
            werp() 
        }
        drawChart(throws)
    })
}

const werp10000El = document.querySelector("#werp-10000")
if (werp10000El) {
    werp10000El.addEventListener("click", function() { 
        for (let i = 0; i < 10000; i++) {
            werp() 
        }
        drawChart(throws)
    })
}

const calculateThrow = function(double: boolean, lastThrow = 0 as number) {
    let res = 0
    for (let i = 0; i < dice; i++) {
        res += Math.ceil(Math.random() * 6)
    }
    if (!lastThrow) {
        lastThrow = res
    } else {
        res += lastThrow
    }

    if (double)  {
        res = calculateThrow(false, lastThrow)
    }
    return res
}

const updateDiceResult = function() {
    const dicesEl = document.querySelector("#dices")
    if (dicesEl) {
        dicesEl.innerHTML = dice.toString()
    }

    const diceResultEl = document.querySelector("#dice-result")
    if (diceResultEl) {
        diceResultEl.innerHTML = diceResult.toString()
    }
}


function drawChart(input: number[]) {
    // Create an array with a length equal to the maximum number in the input
    const maxValue = Math.max(...input)
    const data = Array.from({ length: maxValue }, (_, i) => i + 1).reduce((acc, num) => {
        acc[num] = 0 // Initialize all numbers to 0 frequency
        return acc
    }, {} as Record<number, number>)

    // Count frequencies in the input
    input.forEach(num => {
        data[num] = (data[num] || 0) + 1
    })

    // Get SVG element and set viewBox dimensions dynamically
    const svg = document.getElementById("chart") as SVGElement
    svg.innerHTML = "" // Clear previous chart
    const barWidth = 40
    const barGap = 20
    const numBars = Object.keys(data).length
    const chartWidth = numBars * (barWidth + barGap) + barGap // Total width based on bars and gaps
    const chartHeight = 400 // Fixed height for simplicity

    // Set the viewBox attribute
    svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight + 20}`) // Extra space for labels

    const maxFrequency = Math.max(...Object.values(data))
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

