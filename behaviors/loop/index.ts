import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior"
import stateWriterBehavior from "./stateWriter.behavior"
import stateBehavior from "./state.behavior"
import unsubscribeBehavior from "./unsubscribe.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    unsubscribeBehavior
  ], { failFast: true })
}