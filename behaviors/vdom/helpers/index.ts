import { equalTo, expect, resolvesTo } from "great-expectations"
import { selectElements } from "./displayElement.js"

export async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

export interface ExpectChildOptions {
  atIndex: number
}

export async function expectChild(testId: number, options: ExpectChildOptions) {
  await expect(selectElements("[data-child]").at(options.atIndex).text(), resolvesTo(`child-${testId} (${options.atIndex})`))
}
