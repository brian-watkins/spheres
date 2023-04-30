import { validate } from "esbehavior"
import stateBehavior from "./state.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior
  ], { failFast: true })
}