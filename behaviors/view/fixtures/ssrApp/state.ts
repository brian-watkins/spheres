import { container } from "@spheres/store"

export const clickCount = container({ id: "click-count", initialValue: 0 })

export const nameState = container({ initialValue: "Awesome Person" })