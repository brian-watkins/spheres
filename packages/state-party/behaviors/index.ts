import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior.js"
import stateWriterBehavior from "./stateWriter.behavior.js"
import stateBehavior from "./state.behavior.js"
import updateContainerBehavior from "./updateContainer.behavior.js"
import metaBehavior from "./meta.behavior.js"
import valueBehavior from "./value.behavior.js"
import ruleBehavior from "./rule.behavior.js"
import queryBehavior from "./query.behavior.js"
import debugBehavior from "./debug.behavior.js"
import batchBehavior from "./batch.behavior.js"
import storeEffectBehavior from "./storeEffect.behavior.js"
import runBehavior from "./run.behavior.js"
import resetBehavior from "./reset.behavior.js"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    metaBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    ruleBehavior,
    batchBehavior,
    runBehavior,
    queryBehavior,
    resetBehavior,
    storeEffectBehavior,
    updateContainerBehavior,
    valueBehavior,
    debugBehavior
  ], { failFast: true })
}