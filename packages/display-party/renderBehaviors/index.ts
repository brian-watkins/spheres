import { validate } from "esbehavior"
import mountBehavior from "./mount.behavior.js"
import patchBehavior from "patch.behavior.js"

window.validateBehaviors = () => {
  return validate([
    mountBehavior,
    patchBehavior
  ], { failFast: true })
}