import { defineConfig } from "vite"

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: "index.html",
                home: "pages/home.html",
                "deck-builder": "pages/deck-builder.html",
                "hand-power-visualizer": "pages/hand-power-visualizer.html",
                "player-hand-power": "pages/player-hand-power.html",
                "generate-hand-values": "pages/generate-hand-values.html"
            }
        }
    }
})
