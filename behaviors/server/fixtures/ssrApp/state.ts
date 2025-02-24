import { container } from "@store/index.js"

export const clickCount = container({ initialValue: 0 })

export const nameState = container({ initialValue: "Awesome Person" })