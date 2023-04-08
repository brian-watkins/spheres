import { Summary, validate } from "esbehavior";
import { Browser } from "playwright";
import cssBehavior from "./css.behavior.js";
import dynamicViewStateBehavior from "./dynamicViewState.behavior.js";
import elementBehavior from "./element.behavior.js";
import eventBehavior from "./event.behavior.js";
import { DisplayBehaviorOptions, testAppContext } from "./helpers/testAppController.js";
import inputPropertiesBehavior from "./inputProperties.behavior.js";
import renderBehavior from "./render.behavior.js";
import viewBehavior from "./view.behavior.js";
import clientActivationBehavior from "./clientActivation.behavior.js";
import { fixStackTrace } from "./helpers/stackTrace.js";

export async function validateBehaviors(browser: Browser, serverHost: string, options: DisplayBehaviorOptions): Promise<Summary> {
  
  const page = await browser.newPage()
  page.on("console", (message) => console.log(fixStackTrace(serverHost, message.text())))
  page.on("pageerror", console.log)

  await page.goto(`${serverHost}/behaviors/display/index.html`)

  const appContext = testAppContext(page, options)
  
  return validate([
    elementBehavior(appContext),
    viewBehavior(appContext),
    cssBehavior(appContext),
    eventBehavior(appContext),
    inputPropertiesBehavior(appContext),
    dynamicViewStateBehavior(appContext),
    renderBehavior,
    clientActivationBehavior(browser, options.debug)
  ], { failFast: true })
}