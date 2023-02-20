import { Summary, validate } from "esbehavior";
import { Page } from "playwright";
import elementBehavior from "./element.behavior.js";
import eventBehavior from "./event.behavior.js";
import { testAppContext } from "./helpers/testAppController.js";

export function validateBehaviors(page: Page): Promise<Summary> {
  const context = testAppContext(page)
  
  return validate([
    elementBehavior(context),
    eventBehavior(context)
  ])
}