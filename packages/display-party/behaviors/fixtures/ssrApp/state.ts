import { container, withInitialValue } from "state-party"

export const clickCount = container(withInitialValue(0))

export const nameState = container(withInitialValue("Awesome Person"))