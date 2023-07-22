import { VirtualNode, VirtualNodeConfig, addAttribute, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";

export default behavior("list patch", [
  example(renderContext())
    .description("removing from the end of a list")
    .script({
      suppose: [
        fact("element with multiple children", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
            childElement(3)
          ]))
        })
      ],
      perform: [
        step("remove two of the children", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
          ]))
        })
      ],
      observe: [
        effect("there is just one child", async () => {
          await expectTotalChildren(1)
          await expectChild(1)
        })
      ]
    }),
  example(renderContext())
    .description("removing from the beginning of a list")
    .script({
      suppose: [
        fact("element with multiple children", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
            childElement(3)
          ]))
        })
      ],
      perform: [
        step("remove two of the children", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(3),
          ]))
        })
      ],
      observe: [
        effect("there is just one child", async () => {
          await expectTotalChildren(1)
          await expectChild(3)
        })
      ]
    }),
  (m) => m.pick() && example(renderContext())
    .description("removing from throughout a list")
    .script({
      suppose: [
        fact("element with multiple children", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
            childElement(3),
            childElement(4),
            childElement(5),
          ]))
        })
      ],
      perform: [
        step("remove some of the children", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(3),
            childElement(5)
          ]))
        })
      ],
      observe: [
        effect("there remaining children are present", async () => {
          await expectTotalChildren(3)
          await expectChild(1)
          await expectChild(3)
          await expectChild(5)
        })
      ]
    }),
])

function childConfig(testId: number): VirtualNodeConfig {
  const config = virtualNodeConfig()
  addAttribute(config, "data-child", `${testId}`)
  return config
}

function childElement(testId: number): VirtualNode {
  return makeVirtualElement("div", childConfig(testId), [
    makeVirtualTextNode(`child ${testId}`)
  ])
}

async function expectTotalChildren(total: number) {
  await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(total)))
}

async function expectChild(testId: number) {
  await expect(selectElement(`[data-child='${testId}']`).text(), resolvesTo(equalTo(`child ${testId}`)))
}