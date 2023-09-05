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
import clientActivationBehavior from "./clientActivation.behavior.js";
import { TestSSRServer, ssrTestAppContext } from "./helpers/testSSRServer.js";
import bindBehavior from "./bind.behavior.js";

export async function validateBehaviors(page: Page, ssrServer: TestSSRServer, options: DisplayBehaviorOptions): Promise<Summary> {
  const appContext = testAppContext(page, options)
  const ssrAppContext = ssrTestAppContext(page, ssrServer)

  return validate([
    elementBehavior(appContext),
    viewBehavior(appContext),
    cssBehavior(appContext),
    eventBehavior(appContext),
    bindBehavior(appContext),
    inputPropertiesBehavior(appContext),
    dynamicViewStateBehavior(appContext),
    renderBehavior,
    clientActivationBehavior(ssrAppContext)
  ], { failFast: true })
}