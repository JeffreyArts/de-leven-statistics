export type CardName = 
    "Dubbele worp" |
    "Best of 3" |
    "Extra dobbelsteen" |
    "Meerdere dobbelstenen" |
    "Wissel positie" |
    "Speler links" |
    "Speler rechts" |
    "Links, rechts" |
    "Iedereen" |
    "Pak een kaart" |
    "Achterwaarts" 

export const CardTypes = [
    "Dubbele worp",
    "Best of 3",
    "Extra dobbelsteen",
    "Meerdere dobbelstenen",
    "Wissel positie",
    "Speler links",
    "Speler rechts",
    "Links, rechts",
    "Iedereen",
    "Pak een kaart",
    "Achterwaarts" 
] as CardName[]

class Card {
    public selected: boolean = false
    public tr: HTMLTableRowElement | null = null
    public readonly id: string = Math.random().toString(36).substr(2, 9)
    public readonly description: string 
    constructor(
        public readonly name: CardName,
    ) {
        switch (name) {
            case "Dubbele worp":
                this.description = "Gooi twee keer"
                break
            case "Best of 3":
                this.description = "Gooi 3-maal, de beste telt"
                break
            case "Extra dobbelsteen":
                this.description = "Voeg 1 extra dobbelsteen toe aan je worp"
                break
            case "Meerdere dobbelstenen":
                this.description = "Werp om te bepalen met hoeveel dobbelstenen je mag gooien"
                break
            case "Wissel positie":
                this.description = "Wissel van positie met een speler naar keuze"
                break
            case "Speler links":
                this.description = "Speler links van je moet bewegen"
                break
            case "Speler rechts":
                this.description = "Speler rechts van je moet bewegen"
                break
            case "Links, rechts":
                this.description = "Spelers links en rechts van je moeten bewegen "
                break
            case "Iedereen":
                this.description = "Iedereen beweegt hetzelfde aantal stappen"
                break
            case "Pak een kaart":
                this.description = "Kies een willekeurige kaart van een andere speler."
                break
            case "Achterwaarts":
                this.description = "Beweeg het geworpen aantal stappen naar achteren"
                break
        }
    }
}

export {Card}
export default Card