import { Observation, effect } from "best-behavior"
import { equalTo, expect, is } from "great-expectations"
import { TestAppController } from "./testAppController.js"

export function theElementExists(tag: string): Observation<TestAppController> {
  return effect(`there is a ${tag} element`, async (context) => {
    const hasElement = await context.display.select(tag).exists()
    expect(hasElement, is(equalTo(true)), `the ${tag} element exists`)
  })
}

export function theElementHasText(tag: string, text: string): Observation<TestAppController> {
  return effect(`there is a ${tag} element with text`, async (context) => {
    const elementText = await context.display.select(tag).text()
    expect(elementText, is(equalTo(text)))
  })
}