import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior.js"
import stateWriterBehavior from "./stateWriter.behavior.js"
import stateBehavior from "./state.behavior.js"
import updateContainerBehavior from "./updateContainer.behavior.js"
import metaBehavior from "./meta.behavior.js"
import valueBehavior from "./value.behavior.js"
import selectionBehavior from "./selection.behavior.js"
import queryBehavior from "./query.behavior.js"
import debugBehavior from "./debug.behavior.js"
import batchBehavior from "batch.behavior.js"
import storeQueryBehavior from "storeQuery.behavior.js"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    metaBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    selectionBehavior,
    batchBehavior,
    queryBehavior,
    storeQueryBehavior,
    updateContainerBehavior,
    valueBehavior,
    debugBehavior
  ], { failFast: true })
}