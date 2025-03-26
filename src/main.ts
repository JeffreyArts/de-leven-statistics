import "/src/scss/style.scss"
import { NavigationService } from "./services/navigation.service"

const nav = document.querySelector("#nav")
const contentPage = document.querySelector("#contentPage") as HTMLIFrameElement

const routes = [
    { path: "/", name: "Home", file: "/pages/home.html" },
    { path: "/deck-builder", name: "Deck Builder", file: "/pages/deck-builder.html" },
    { path: "/hand-power-visualizer", name: "Kaartkracht graph", file: "/pages/hand-power-visualizer.html" },
    { path: "/kaart-rating", name: "Kaart rating", file: "/pages/kaart-rating.html" },
    { path: "/hand-power", name: "Hand kracht", file: "/pages/hand-power.html" },
    { path: "/player-hand-power", name: "Speler handkracht", file: "/pages/player-hand-power.html" },
    { path: "/generate-hand-values", name: "Genereer hand combinaties", file: "/pages/generate-hand-values.html" }
]

// Functie om te navigeren
const navigate = (path: string, file: string) => {
    contentPage.src = file
    window.history.pushState({ path }, "", path)
}

// Genereer de navigatie
routes.forEach(route => {
    const a = document.createElement("a")
    a.href = route.path
    a.textContent = route.name
    a.addEventListener("click", (e) => {
        e.preventDefault()
        navigate(route.path, route.file)
    })
    nav?.appendChild(a)
})

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
    const route = routes.find(r => r.path === window.location.pathname) || routes[0]
    contentPage.src = route.file
})

// Stel de initiële pagina in
const initialRoute = routes.find(r => r.path === window.location.pathname) || routes[0]
navigate(initialRoute.path, initialRoute.file)

// Initialiseer de navigatie service
NavigationService.getInstance()