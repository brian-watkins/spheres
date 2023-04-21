import { container, withInitialValue } from "../../../../src/index.js";

export const clickCount = container(withInitialValue(0))

export const nameState = container(withInitialValue("Awesome Person"))