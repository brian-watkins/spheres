import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior.js"
import stateWriterBehavior from "./stateWriter.behavior.js"
import stateBehavior from "./state.behavior.js"
import unsubscribeBehavior from "./unsubscribe.behavior.js"
import ruleBehavior from "./rule.behavior.js"
import updateContainerBehavior from "./updateContainer.behavior.js"
import metaBehavior from "./meta.behavior.js"
import queryBehavior from "./query.behavior.js"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    metaBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    ruleBehavior,
    queryBehavior,
    unsubscribeBehavior,
    updateContainerBehavior,
  ], { failFast: true })
}