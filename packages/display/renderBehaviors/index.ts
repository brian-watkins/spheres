import { validate } from "esbehavior"
import mountBehavior from "./mount.behavior.js"
import patchBehavior from "patch.behavior.js"
import listReorderBehavior from "listReorder.behavior.js"
import listRemoveBehavior from "listRemove.behavior.js"
import listInsertBehavior from "listInsert.behavior.js"
import eventBehavior from "event.behavior.js"

window.validateBehaviors = () => {
  return validate([
    mountBehavior,
    patchBehavior,
    listInsertBehavior,
    listRemoveBehavior,
    listReorderBehavior,
    eventBehavior
  ], { failFast: true })
}