import { validate } from "esbehavior"
import eventBehavior from "./event.behavior"
import stateProviderBehavior from "./stateProvider.behavior"
import managedUpdateBehavior from "./managedUpdate.behavior"
import stateBehavior from "./state.behavior"
import viewBehavior from "./view.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    viewBehavior,
    eventBehavior,
    stateProviderBehavior,
    managedUpdateBehavior
  ], { failFast: true })
}