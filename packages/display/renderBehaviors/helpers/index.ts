import { VirtualNode, VirtualNodeConfig, addAttribute, makeBlockElement, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setKey, virtualNodeConfig } from "@src/vdom/virtualNode.js"
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
  setKey(statefulConfig, testId)
  return makeStatefulElement(statefulConfig, () => {
    const config = virtualNodeConfig()
    addAttribute(config, "data-stateful-child", `${testId}`)
    return makeVirtualElement("div", config, [
      makeVirtualTextNode(`stateful child ${testId}`)
    ])
  })
}

export function blockChildElement(testId: number): VirtualNode {
  const config = virtualNodeConfig()
  setKey(config, testId)
  const treeConfig = virtualNodeConfig()
  addAttribute(treeConfig, "data-block-child", `${testId}`)
  const block = () => makeVirtualElement("div", treeConfig, [
    makeVirtualTextNode(`block child ${testId}`)
  ])
  return makeBlockElement(config, block)
}

export async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

export async function expectChild(testId: number) {
  await expect(selectElement(`[data-child='${testId}']`).text(), resolvesTo(`child ${testId}`))
}

export async function expectStatefulChild(testId: number) {
  await expect(selectElement(`[data-stateful-child='${testId}']`).text(), resolvesTo(`stateful child ${testId}`))
}

export async function expectTotalStatefulChildren(total: number) {
  await expect(selectElements(`[data-stateful-child]`).count(), resolvesTo(total))
}

export async function expectBlockChild(testId: number) {
  await expect(selectElement(`[data-block-child='${testId}]`).text(), resolvesTo(`block child ${testId}`))
}

export async function expectTotalBlockChildren(total: number) {
  await expect(selectElements(`[data-block-child]`).count(), resolvesTo(total))
}