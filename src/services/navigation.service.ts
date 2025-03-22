export class NavigationService {
    private static instance: NavigationService
    private iframe: HTMLIFrameElement | null = null
    private defaultPage: string = "/pages/home"

    private constructor() {
        this.initialize()
    }

    public static getInstance(): NavigationService {
        if (!NavigationService.instance) {
            NavigationService.instance = new NavigationService()
        }
        return NavigationService.instance
    }

    private initialize(): void {
        // Haal de iframe op
        this.iframe = document.getElementById("contentPage") as HTMLIFrameElement
        
        // Luister naar navigatie events
        window.addEventListener("popstate", () => this.handleUrlChange())
        
        // Luister naar clicks op navigatie links
        document.addEventListener("click", (e) => {
            const target = e.target as HTMLAnchorElement
            if (target.tagName === "A" && target.target === "contentPage") {
                e.preventDefault()
                const href = target.getAttribute("href")
                if (href) {
                    // Verwijder /pages/ uit de URL voor de adresbalk
                    const cleanPath = href.replace("/pages/", "")
                    this.navigateTo(cleanPath)
                }
            }
        })

        // Laad de initiële pagina op basis van de URL
        this.handleUrlChange()
    }

    private handleUrlChange(): void {
        const path = window.location.pathname
        if (path === "/") {
            this.navigateTo(this.defaultPage.replace("/pages/", ""))
        } else {
            this.loadPage(path)
        }
    }

    public navigateTo(path: string): void {
        // Update de URL zonder de pagina te verversen
        window.history.pushState({}, "", path)
        this.loadPage(path)
    }

    private loadPage(path: string): void {
        if (!this.iframe) return

        // Voeg /pages/ toe aan het pad voor de iframe
        const fullPath = `/pages/${path}${path.endsWith(".html") ? "" : ".html"}`
        this.iframe.src = fullPath
    }
} 