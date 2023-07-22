import { VirtualNodeConfig, addAttribute, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElements } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";

export default behavior("list patch", [
  example(renderContext())
    .description("removing from the end of a list")
    .script({
      suppose: [
        fact("element with multiple children", (context) => {
          const child1 = makeVirtualElement("div", childConfig(1), [
            makeVirtualTextNode("child 1")
          ])
          const child2 = makeVirtualElement("div", childConfig(2), [
            makeVirtualTextNode("child 2")
          ])
          const child3 = makeVirtualElement("div", childConfig(3), [
            makeVirtualTextNode("child 3")
          ])
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            child1,
            child2,
            child3
          ]))
        })
      ],
      perform: [
        step("remove two of the children", (context) => {
          const child1 = makeVirtualElement("div", childConfig(1), [
            makeVirtualTextNode("child 1")
          ])
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            child1,
          ]))
        })
      ],
      observe: [
        effect("there is just one child", async () => {
          await expect(selectElements("[data-child]").count(), resolvesTo(equalTo(1)))
        })
      ]
    })
])

function childConfig(testId: number): VirtualNodeConfig {
  const config = virtualNodeConfig()
  addAttribute(config, "data-child", `${testId}`)
  return config
}