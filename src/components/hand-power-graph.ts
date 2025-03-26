import { CardName } from "../models/card"

export interface HandWaarde {
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

export class HandPowerGraph {
    private svg: SVGElement
    private width: number = 100
    private height: number = 50
    private lineLength: number = 78
    private startX: number

    constructor(svgElement: SVGElement) {
        this.svg = svgElement
        this.startX = (this.width - this.lineLength) / 2
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`)
    }

    public draw(matchingHand?: HandWaarde) {
        this.svg.innerHTML = "" // Clear previous chart
        
        this.drawBaseLines()
        this.drawTicksAndNumbers()
        this.drawPlayerBalls()
        this.drawRanges(matchingHand)
    }

    private drawBaseLines() {
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            line.setAttribute("x1", this.startX.toString())
            line.setAttribute("x2", (this.startX + this.lineLength).toString())
            line.setAttribute("y1", (this.height/2 + (i-1)*15).toString())
            line.setAttribute("y2", (this.height/2 + (i-1)*15).toString())
            line.setAttribute("stroke", "#ccc")
            line.setAttribute("stroke-width", "0.32")
            this.svg.appendChild(line)
        }
    }

    private drawTicksAndNumbers() {
        for (let x = 0; x <= this.lineLength; x += 6) {
            const xPos = this.startX + x
            // Verticale streep
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
            tick.setAttribute("x1", xPos.toString())
            tick.setAttribute("x2", xPos.toString())
            tick.setAttribute("y1", (this.height/2 - 20).toString())
            tick.setAttribute("y2", (this.height/2 + 20).toString())
            tick.setAttribute("stroke", "#ccc")
            tick.setAttribute("stroke-width", ".16")
            this.svg.appendChild(tick)

            // Cijfer
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttribute("x", xPos.toString())
            text.setAttribute("y", (this.height/2 + 23).toString())
            text.setAttribute("text-anchor", "middle")
            text.setAttribute("fill", "#ccc")
            text.setAttribute("font-size", "2")
            text.textContent = x.toString()
            this.svg.appendChild(text)
        }
    }

    private drawPlayerBalls() {
        const playerColors = ["#90f", "#f09", "#0f9"]
        const playerNames = ["Speler links", "Jij", "Speler rechts"]
        
        for (let i = 0; i < 3; i++) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
            circle.setAttribute("cx", this.startX.toString())
            circle.setAttribute("cy", `${this.height/2 + (i-1)*15}`)
            circle.setAttribute("r", "1.6")
            circle.setAttribute("fill", playerColors[i])
            this.svg.appendChild(circle)

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttribute("x", this.startX.toString())
            text.setAttribute("y", `${this.height/2 + (i-1)*15 - 5}`)
            text.setAttribute("text-anchor", "middle")
            text.setAttribute("fill", playerColors[i])
            text.setAttribute("font-size", "2")
            text.textContent = playerNames[i]
            this.svg.appendChild(text)
        }
    }

    private drawRanges(matchingHand?: HandWaarde) {
        let appliedToSelf = true
        let appliedToOthers = 0
        let range: [number, number] = [1, 6]
        let kaarten = [] as CardName[]
        let kansen = [
            { waarde: 1, percentage: 16 },
            { waarde: 2, percentage: 16 },
            { waarde: 3, percentage: 16 },
            { waarde: 4, percentage: 16 },
            { waarde: 5, percentage: 16 },
            { waarde: 6, percentage: 16 }
        ]

        if (matchingHand) {
            ({ appliedToSelf, appliedToOthers, kansen, range, kaarten } = matchingHand)
        }

        const maxPercentage = Math.max(...kansen.map(k => k.percentage))
        const scale = 5 / Math.log10(maxPercentage + 1)

        if (appliedToSelf) {
            this.drawRangeCurve(kansen, 1, scale, range)
        }

        if (appliedToOthers == 1) {
            if (kaarten.includes("Speler links")) {
                this.drawRangeCurve(kansen, 0, scale, range)
            }
            if (kaarten.includes("Speler rechts")) {
                this.drawRangeCurve(kansen, 2, scale, range)
            }
        }

        if (appliedToOthers >= 2) {
            this.drawRangeCurve(kansen, 0, scale, range)
            this.drawRangeCurve(kansen, 2, scale, range)
        }
    }

    private drawRangeCurve(
        kansen: Array<{ waarde: number; percentage: number }>,
        spelerIndex: number,
        scale: number,
        range: [number, number]
    ) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        const y = this.height/2 + (spelerIndex-1)*15
        const playerColors = ["#90f", "#f09", "#0f9"]
        const color = playerColors[spelerIndex]
        
        const rangeStartX = this.startX + range[0]
        let d = `M ${rangeStartX} ${y}`
        
        const sortedKansen = [...kansen].sort((a, b) => a.waarde - b.waarde)
        const filteredKansen = sortedKansen.filter(kans => 
            kans.waarde >= range[0] && kans.waarde <= range[1]
        )
        
        for (let index = 0; index < filteredKansen.length; index++) {
            const kans = filteredKansen[index]
            const x = this.startX + kans.waarde
            const thickness = Math.max(.1, Math.log10(kans.percentage + 1) * scale)
            
            if (index === 0) {
                d += ` L ${x} ${y - thickness}`
            } else {
                d += ` ${x} ${y - thickness}`
            }
        }

        for (let index = filteredKansen.length - 1; index >= 0; index--) {
            const kans = filteredKansen[index]
            const x = this.startX + kans.waarde
            const thickness = Math.max(.1, Math.log10(kans.percentage + 1) * scale)
            
            if (index === 0) {
                d += ` L ${x} ${y + thickness}`
            } else {
                d += ` ${x} ${y + thickness}`
            }
        }
        
        d += ` L ${rangeStartX} ${y} L ${rangeStartX} ${y} Z`
        
        path.setAttribute("d", d)
        path.setAttribute("fill", color)
        path.setAttribute("stroke", "none")
        path.setAttribute("opacity", "0.8")
        this.svg.appendChild(path)
    }
} 