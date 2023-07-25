import { makeVirtualElement, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { selectElements } from "helpers/displayElement.js";
import { childElement, statefulChildElement } from "helpers/index.js";
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
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child 1",
            "child 2",
            "child 3",
            "child 4",
            "child 5",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("insert at beginning")
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
        step("some elements are added to the beginning", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(3),
            childElement(4),
            childElement(5),
            childElement(1),
            childElement(2),
          ]))
        })
      ],
      observe: [
        effect("the elements are all in the list", async () => {
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child 3",
            "child 4",
            "child 5",
            "child 1",
            "child 2",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("insert throughout")
    .script({
      suppose: [
        fact("there is a list of elements", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(2),
            childElement(3),
          ]))
        })
      ],
      perform: [
        step("some elements are added throughout", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(1),
            childElement(4),
            childElement(2),
            childElement(5),
            childElement(3),
          ]))
        })
      ],
      observe: [
        effect("the elements are all in the list in the right order", async () => {
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child 1",
            "child 4",
            "child 2",
            "child 5",
            "child 3",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("insert new keyed elements throughout")
    .script({
      suppose: [
        fact("there are some keyed elements", (context) => {
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(1),
            statefulChildElement(2),
          ]))
        })
      ],
      perform: [
        step("new keyed elements are inserted", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(8),
            statefulChildElement(1),
            statefulChildElement(3),
            statefulChildElement(4),
            statefulChildElement(2),
            statefulChildElement(5),
            statefulChildElement(6),
          ]))
        })
      ],
      observe: [
        effect("the elements are all in the right order", async () => {
          const texts = await selectElements("[data-stateful-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "stateful child 8",
            "stateful child 1",
            "stateful child 3",
            "stateful child 4",
            "stateful child 2",
            "stateful child 5",
            "stateful child 6",
          ])))
        })
      ]
    })
])