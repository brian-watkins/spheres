import { validate } from "esbehavior"
import eventBehavior from "./event.behavior"
import stateBehavior from "./state.behavior"
import viewBehavior from "./view.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    viewBehavior,
    eventBehavior
  ], { failFast: true })
}