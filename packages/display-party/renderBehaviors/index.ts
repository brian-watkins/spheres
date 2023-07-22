import { validate } from "esbehavior"
import mountBehavior from "./mount.behavior.js"
import patchBehavior from "patch.behavior.js"
import listPatchBehavior from "listPatch.behavior.js"

window.validateBehaviors = () => {
  return validate([
    mountBehavior,
    patchBehavior,
    listPatchBehavior
  ], { failFast: true })
}