import { validate } from "esbehavior"
import stateProviderBehavior from "./stateProvider.behavior"
import stateWriterBehavior from "./stateWriter.behavior"
import stateBehavior from "./state.behavior"
import unsubscribeBehavior from "./unsubscribe.behavior"
import cssBehavior from "./css.behavior"

window.validateBehaviors = () => {
  return validate([
    stateBehavior,
    cssBehavior,
    stateProviderBehavior,
    stateWriterBehavior,
    unsubscribeBehavior
  ], { failFast: true })
}