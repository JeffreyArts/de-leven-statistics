import "./scss/style.scss"
import { NavigationService } from "./services/navigation.service"

const nav = [
    { text: "Home", link: "/pages/home" },
    { text: "Hand Power Visualizer", link: "/pages/hand-power-visualizer" },
    { text: "Deck Builder", link: "/pages/deck-builder" },
    { text: "Player Hand Power", link: "/pages/player-hand-power" },
    { text: "Genereer Hand Waarden", link: "/pages/generate-hand-values" },
]

const navEl = document.getElementById("nav")
if (navEl) {
    nav.forEach(item => {
        const a = document.createElement("a")
        a.href = item.link
        a.innerHTML = item.text
        a.target = "contentPage"
        navEl.appendChild(a)
    })
}

// Initialiseer de navigatie service
NavigationService.getInstance()