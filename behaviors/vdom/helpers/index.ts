import { VirtualNode, VirtualNodeConfig, addAttribute, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js"
import { equalTo, expect, resolvesTo } from "great-expectations"
import { selectElement, selectElements } from "./displayElement.js"
import { HTMLElements } from "@src/htmlElements.js"

function childConfig(testId: number): VirtualNodeConfig {
  const config = virtualNodeConfig()
  addAttribute(config, "data-child", `${testId}`)
  return config
}

export function addChildElement(children: HTMLElements, testId: number) {
  children.div(el => {
    el.config.dataAttribute("child", `${testId}`)
    el.children.textNode(`child ${testId}`)
  })
}

export function childElement(testId: number): VirtualNode {
  return makeVirtualElement("div", childConfig(testId), [
    makeVirtualTextNode(`child ${testId}`)
  ])
}

export function statefulChildElement(testId: number): VirtualNode {
  return makeStatefulElement(() => {
    const config = virtualNodeConfig()
    addAttribute(config, "data-stateful-child", `${testId}`)
    return makeVirtualElement("div", config, [
      makeVirtualTextNode(`stateful child ${testId}`)
    ])
  }, testId)
}

export async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

export interface ExpectChildOptions {
  atIndex: number
}

export async function expectChild(testId: number, options: ExpectChildOptions) {
  await expect(selectElements("[data-child]").at(options.atIndex).text(), resolvesTo(`child-${testId}`))
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