import { makeVirtualElement, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { childElement, expectChild, expectTotalChildren } from "helpers/index.js";
import { renderContext } from "helpers/renderContext.js";

export default behavior("insert items into list", [
  example(renderContext())
    .description("insert at end")
    .script({
      suppose: [
        fact("there is a list of elements", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
          ]))
        })
      ],
      perform: [
        step("some elements are added to the end", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
            childElement(3),
            childElement(4),
            childElement(5),
          ]))
        })
      ],
      observe: [
        effect("the elements are all in the list", async () => {
          await expectTotalChildren(5)
          await expectChild(1)
          await expectChild(2)
          await expectChild(3)
          await expectChild(4)
          await expectChild(5)
        })
      ]
    })
])