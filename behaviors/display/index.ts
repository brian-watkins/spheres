import { Summary, validate } from "esbehavior";
import { Page } from "playwright";
import cssBehavior from "./css.behavior.js";
import dynamicViewStateBehavior from "./dynamicViewState.behavior.js";
import elementBehavior from "./element.behavior.js";
import eventBehavior from "./event.behavior.js";
import { DisplayBehaviorOptions, testAppContext } from "./helpers/testAppController.js";
import inputPropertiesBehavior from "./inputProperties.behavior.js";
import renderBehavior from "./render.behavior.js";
import viewBehavior from "./view.behavior.js";

export function validateBehaviors(page: Page, options: DisplayBehaviorOptions): Promise<Summary> {
  const context = testAppContext(page, options)
  
  return validate([
    elementBehavior(context),
    viewBehavior(context),
    cssBehavior(context),
    eventBehavior(context),
    inputPropertiesBehavior(context),
    dynamicViewStateBehavior(context),
    renderBehavior
  ], { failFast: true })
}