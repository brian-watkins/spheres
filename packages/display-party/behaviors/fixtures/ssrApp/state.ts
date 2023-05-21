import { container } from "state-party"

export const clickCount = container({ initialValue: 0 })

export const nameState = container({ initialValue: "Awesome Person" })