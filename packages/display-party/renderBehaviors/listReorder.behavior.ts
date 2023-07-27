import { behavior, effect, example, fact, step } from "esbehavior"
import { renderContext } from "./helpers/renderContext.js";
import { makeVirtualElement, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { childElement, statefulChildElement } from "helpers/index.js";
import { selectElements } from "helpers/displayElement.js";
import { equalTo, expect, is } from "great-expectations";

export default behavior("reorder list", [
  example(renderContext())
    .description("reorder from front to back")
    .script({
      suppose: [
        fact("there is an element with several children", (context) => {
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
        step("the list is reordered", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            childElement(5),
            childElement(4),
            childElement(3),
            childElement(2),
            childElement(1),
          ]))
        })
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("[data-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "child 5",
            "child 4",
            "child 3",
            "child 2",
            "child 1",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("reorder keyed stateful elements")
    .script({
      suppose: [
        fact("there are stateful elements", (context) => {
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
        step("the list is reordered", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(5),
            statefulChildElement(1),
            statefulChildElement(2),
            statefulChildElement(3),
            statefulChildElement(4),
          ]))
        })
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("[data-stateful-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "stateful child 5",
            "stateful child 1",
            "stateful child 2",
            "stateful child 3",
            "stateful child 4",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("replace all keyed stateful elements")
    .script({
      suppose: [
        fact("there are stateful elements", (context) => {
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
        step("the list is replaced with all new elements", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(6),
            statefulChildElement(7),
            statefulChildElement(8),
            statefulChildElement(9),
          ]))
        })
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("[data-stateful-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "stateful child 6",
            "stateful child 7",
            "stateful child 8",
            "stateful child 9",
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the list is replaced again", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            statefulChildElement(10),
            statefulChildElement(11),
            statefulChildElement(12),
            statefulChildElement(13),
          ]))
        })
      ],
      observe: [
        effect("the elements are in the expected order", async () => {
          const texts = await selectElements("[data-stateful-child]").map(el => el.text())
          expect(texts, is(equalTo([
            "stateful child 10",
            "stateful child 11",
            "stateful child 12",
            "stateful child 13",
          ])))
        })
      ]
    }),
])