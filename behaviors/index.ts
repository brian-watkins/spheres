import { validate } from "esbehavior"
import eventBehavior from "./event.behavior"
import stateProviderBehavior from "./stateProvider.behavior"
import stateWriterBehavior from "./stateWriter.behavior"
import stateBehavior from "./state.behavior"
import viewBehavior from "./view.behavior"
import unsubscribeBehavior from "./unsubscribe.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    viewBehavior,
    eventBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    unsubscribeBehavior
  ], { failFast: true })
}