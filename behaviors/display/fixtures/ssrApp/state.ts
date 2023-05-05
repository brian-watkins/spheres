import { container, withInitialValue } from "@src/store"

export const clickCount = container(withInitialValue(0))

export const nameState = container(withInitialValue("Awesome Person"))