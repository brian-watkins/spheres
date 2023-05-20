import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior.js"
import stateWriterBehavior from "./stateWriter.behavior.js"
import stateBehavior from "./state.behavior.js"
import unsubscribeBehavior from "./unsubscribe.behavior.js"
import updateContainerBehavior from "./updateContainer.behavior.js"
import metaBehavior from "./meta.behavior.js"
import commandBehavior from "command.behavior.js"
import ruleBehavior from "rule.behavior.js"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    metaBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    commandBehavior,
    ruleBehavior,
    unsubscribeBehavior,
    updateContainerBehavior,
  ], { failFast: true })
}