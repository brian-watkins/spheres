import { VirtualNode, VirtualNodeConfig, addAttribute, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js"
import { equalTo, expect, resolvesTo } from "great-expectations"
import { selectElement, selectElements } from "./displayElement.js"

function childConfig(testId: number): VirtualNodeConfig {
  const config = virtualNodeConfig()
  addAttribute(config, "data-child", `${testId}`)
  return config
}

export function childElement(testId: number): VirtualNode {
  return makeVirtualElement("div", childConfig(testId), [
    makeVirtualTextNode(`child ${testId}`)
  ])
}

export async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

export async function expectChild(testId: number) {
  await expect(selectElement(`[data-child='${testId}']`).text(), resolvesTo(equalTo(`child ${testId}`)))
}