import "./scss/main.scss"

const nav = [
    { text: "Home", link: "/pages/home" },
    { text: "Hand Power Visualizer", link: "/pages/hand-power-visualizer" },
    { text: "Hand Analyzer", link: "/pages/hand-analyzer" },
    { text: "Player Hand Power", link: "/pages/player-hand-power" },
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