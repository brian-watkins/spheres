import { VirtualNode, VirtualNodeConfig, addAttribute, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setKey, virtualNodeConfig } from "@src/vdom/virtualNode.js"
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

export function statefulChildElement(testId: number): VirtualNode {
  const statefulConfig = virtualNodeConfig()
  setKey(statefulConfig, `${testId}`)
  return makeStatefulElement(statefulConfig, () => {
    const config = virtualNodeConfig()
    addAttribute(config, "data-stateful-child", `${testId}`)
    return makeVirtualElement("div", config, [
      makeVirtualTextNode(`stateful child ${testId}`)
    ])
  })
}

export async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

export async function expectChild(testId: number) {
  await expect(selectElement(`[data-child='${testId}']`).text(), resolvesTo(equalTo(`child ${testId}`)))
}

export async function expectStatefulChild(testId: number) {
  await expect(selectElement(`[data-stateful-child='${testId}']`).text(), resolvesTo(equalTo(`stateful child ${testId}`)))
}

export async function expectTotalStatefulChildren(total: number) {
  await expect(selectElements(`[data-stateful-child]`).count(), resolvesTo(equalTo(total)))
}