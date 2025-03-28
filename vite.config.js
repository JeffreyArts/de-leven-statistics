import { defineConfig } from "vite"

export default defineConfig({
    build: {
        target: "esnext",
        rollupOptions: {
            input: {
                main: "index.html",
                home: "pages/home.html",
                "deck-builder": "pages/deck-builder.html",
                "hand-power-visualizer": "pages/hand-power-visualizer.html",
                "hand-power": "pages/hand-power.html",
                "player-hand-power": "pages/player-hand-power.html",
                "generate-hand-values": "pages/generate-hand-values.html",
                "kaart-rating": "pages/kaart-rating.html"
            }
        }
    }
})
