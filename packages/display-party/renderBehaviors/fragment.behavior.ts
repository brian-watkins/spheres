import { VirtualNode, makeStatefulElement, makeVirtualElement, makeVirtualFragment, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElements } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";
import { Container, container } from "state-party";

export default behavior("fragment", [
  example(renderContext())
    .description("mount a fragment")
    .script({
      suppose: [
        fact("a fragment is mounted", (context) => {
          context.mount(makeVirtualFragment([
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 1")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 2")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 3")
            ])
          ]))
        })
      ],
      observe: [
        effect("the fragment elements are displayed", async () => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo(equalTo([
            "Paragraph 1",
            "Paragraph 2",
            "Paragraph 3",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("patch a fragment")
    .script({
      suppose: [
        fact("a fragment is mounted", (context) => {
          context.mount(makeVirtualFragment([
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 1")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 2")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 3")
            ])
          ]))
        })
      ],
      perform: [
        step("the element is patched", (context) => {
          context.patch(makeVirtualFragment([
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 5")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 7")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 9")
            ]),
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("Paragraph 11")
            ]),
          ]))
        })
      ],
      observe: [
        effect("the patched fragment elements are displayed", async () => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo(equalTo([
            "Paragraph 5",
            "Paragraph 7",
            "Paragraph 9",
            "Paragraph 11",
          ])))
        })
      ]
    }),
  example(renderContext())
    .description("mount and patch fragment as a child of an element")
    .script({
      suppose: [
        fact("there is a fragment that's a child of an element", (context) => {
          const fragment = makeVirtualFragment([
            listItem(1),
            listItem(2),
            listItem(3),
          ])
          context.mount(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            fragment,
            listItem(4),
            listItem(5),
          ]))
        })
      ],
      observe: [
        effect("the items are present", async () => {
          await expectItems([ 0, 1, 2, 3, 4, 5 ])
        })
      ]
    }).andThen({
      perform: [
        step("the fragment is patched", (context) => {
          const fragment = makeVirtualFragment([
            listItem(1),
            listItem(8),
            listItem(7),
            listItem(9),
            listItem(10),
          ])
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            fragment,
            listItem(4),
            listItem(5),
          ]))
        })
      ],
      observe: [
        effect("the fragment elements are updated", async () => {
          await expectItems([ 0, 1, 8, 7, 9, 10, 4, 5 ])
        })
      ]
    }).andThen({
      perform: [
        step("elements are inserted prior to and after the fragment", (context) => {
          const fragment = makeVirtualFragment([
            listItem(1),
            listItem(8),
            listItem(7),
            listItem(9),
            listItem(10),
          ])
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            listItem(18),
            listItem(21),
            fragment,
            listItem(17),
            listItem(4),
            listItem(5),
          ]))
        })
      ],
      observe: [
        effect("the fragment elements are updated", async () => {
          await expectItems([ 0, 18, 21, 1, 8, 7, 9, 10, 17, 4, 5 ])
        })
      ]
    }),
  example(renderContext<Container<number>>())
    .description("stateful fragment")
    .script({
      suppose: [
        fact("there is some state for number of items", (context) => {
          context.setState(container({ initialValue: 2 }))
        }),
        fact("there is a stateful fragment", (context) => {
          const statefulFragment = makeStatefulElement(virtualNodeConfig(), (get) => {
            let items = []
            for (let i = 0; i < get(context.state); i++) {
              items.push(listItem(i))
            }
            return makeVirtualFragment(items)
          })
          context.mount(makeVirtualElement("ol", virtualNodeConfig(), [
            statefulFragment
          ]))
        })
      ],
      observe: [
        effect("it displays the items", async () => {
          await expectItems([ 0, 1 ])
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated to add new items", (context) => {
          context.writeTo(context.state, 8)
        })
      ],
      observe: [
        effect("it displays the items", async () => {
          await expectItems([ 0, 1, 2, 3, 4, 5, 6, 7 ])
        })
      ]
    }),
  example(renderContext())
    .description("nested fragments")
    .script({
      suppose: [
        fact("there are nested fragments", (context) => {
          const fragment1 = makeVirtualFragment([
            listItem(1),
            listItem(2),
            listItem(3),
          ])
          const fragment2 = makeVirtualFragment([
            listItem(4),
            fragment1,
            listItem(5),
            listItem(6),
          ])
          const fragment3 = makeVirtualFragment([
            listItem(7),
            listItem(8),
            fragment2
          ])
          context.mount(makeVirtualElement("ol", virtualNodeConfig(), [
            fragment3
          ]))
        })
      ],
      observe: [
        effect("the list items are displayed", async () => {
          await expectItems([ 7, 8, 4, 1, 2, 3, 5, 6 ])
        })
      ]
    }).andThen({
      perform: [
        step("a nested fragment is patched", (context) => {
          const fragment1 = makeVirtualFragment([
            listItem(1),
            listItem(21),
            listItem(22),
            listItem(3),
          ])
          const fragment2 = makeVirtualFragment([
            fragment1,
            listItem(5),
            listItem(6),
          ])
          const fragment3 = makeVirtualFragment([
            listItem(7),
            listItem(8),
            fragment2,
            listItem(9)
          ])
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            fragment3
          ]))
        })
      ],
      observe: [
        effect("the nested fragment is updated", async () => {
          await expectItems([ 7, 8, 1, 21, 22, 3, 5, 6, 9 ])
        })
      ]
    }),
  example(renderContext())
    .description("fragment with no children")
    .script({
      suppose: [
        fact("there is a fragment with no children", (context) => {
          context.mount(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            makeVirtualFragment([]),
            listItem(1)
          ]))
        })
      ],
      observe: [
        effect("it renders the other elements", async () => {
          await expectItems([ 0, 1 ])
        })
      ]
    }).andThen({
      perform: [
        step("items are added to the fragment", (context) => {
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            makeVirtualFragment([
              listItem(6),
              listItem(7),
              listItem(8),
            ]),
            listItem(1)
          ]))
        })
      ],
      observe: [
        effect("it renders the other elements", async () => {
          await expectItems([ 0, 6, 7, 8, 1 ])
        })
      ]
    }),
  example(renderContext())
    .description("adding and removing fragment at end of list")
    .script({
      suppose: [
        fact("there is no fragment", (context) => {
          context.mount(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0)
          ]))
        })
      ],
      perform: [
        step("the fragment is added to the end of the list", (context) => {
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0),
            makeVirtualFragment([
              listItem(1),
              listItem(2),
              listItem(3),
            ])
          ]))
        })
      ],
      observe: [
        effect("the fragment is displayed", async () => {
          await expectItems([ 0, 1, 2, 3 ])
        })
      ]
    }).andThen({
      perform: [
        step("the fragment is removed", (context) => {
          context.patch(makeVirtualElement("ol", virtualNodeConfig(), [
            listItem(0)
          ]))
        })
      ],
      observe: [
        effect("the fragment is not longer displayed", async () => {
          await expectItems([ 0 ])
        })
      ]
    })
])

function listItem(testId: number): VirtualNode {
  return makeVirtualElement("li", virtualNodeConfig(), [
    makeVirtualTextNode(`Item ${testId}`)
  ])
}

async function expectItems(items: Array<number>) {
  await expect(selectElements("li").map(el => el.text()),
    resolvesTo(equalTo(items.map(id => `Item ${id}`))))
}