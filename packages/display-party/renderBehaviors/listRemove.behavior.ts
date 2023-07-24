import { makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { renderContext } from "./helpers/renderContext.js";
import { childElement, expectChild, expectStatefulChild, expectTotalChildren, expectTotalStatefulChildren, statefulChildElement } from "helpers/index.js";
import { selectElementWithText } from "helpers/displayElement.js";
import { equalTo, expect, resolvesTo } from "great-expectations";

export default behavior("removing items from list", [
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
  example(renderContext())
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
  example(renderContext())
    .description("remove stateful element with key in middle of list")
    .script({
      suppose: [
        fact("there are some stateful elements in a list", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(2),
            statefulChildElement(3),
          ]))
        })
      ],
      perform: [
        step("patch to remove the middle element", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(3),
          ]))
        })
      ],
      observe: [
        effect("the other stateful elements remain", async () => {
          await expectStatefulChild(1)
          await expectStatefulChild(3)
          await expectTotalStatefulChildren(2)
        })
      ]
    }),
  example(renderContext())
    .description("remove stateful elements with key throughout list")
    .script({
      suppose: [
        fact("there are some stateful elements in a list", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(2),
            statefulChildElement(3),
            statefulChildElement(4),
            statefulChildElement(5),
          ]))
        })
      ],
      perform: [
        step("patch to remove the middle element", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(3),
            statefulChildElement(5),
          ]))
        })
      ],
      observe: [
        effect("the other stateful elements remain", async () => {
          await expectStatefulChild(1)
          await expectStatefulChild(3)
          await expectStatefulChild(5)
          await expectTotalStatefulChildren(3)
        })
      ]
    }),
  example(renderContext())
    .description("remove text nodes from between keyed nodes")
    .script({
      suppose: [
        fact("there are some stateful elements in a list", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            makeVirtualTextNode("Hello!"),
            statefulChildElement(2),
            statefulChildElement(3),
            makeVirtualTextNode("Goodbye!"),
            statefulChildElement(4),
            statefulChildElement(5),
          ]))
        })
      ],
      perform: [
        step("patch to remove the middle element", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(2),
            makeVirtualTextNode("Goodbye!"),
            statefulChildElement(4),
            statefulChildElement(5),
          ]))
        })
      ],
      observe: [
        effect("the other stateful elements remain", async () => {
          await expectStatefulChild(1)
          await expectStatefulChild(2)
          await expectStatefulChild(4)
          await expectStatefulChild(5)
          await expectTotalStatefulChildren(4)
        }),
        effect("the removed text node is not present", async () => {
          await expect(selectElementWithText("Hello!").exists(), resolvesTo(equalTo(false)))
        }),
        effect("the other text node remains", async () => {
          await expect(selectElementWithText("Goodbye!").exists(), resolvesTo(equalTo(true)))
        })
      ]
    }),
])

