import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior"
import stateWriterBehavior from "./stateWriter.behavior"
import stateBehavior from "./state.behavior"
import unsubscribeBehavior from "./unsubscribe.behavior"
import collectionBehavior from "./collection.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    unsubscribeBehavior,
    collectionBehavior
  ], { failFast: true })
}