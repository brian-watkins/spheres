import { behavior, effect, example, fact, step } from "esbehavior";
import { renderContext } from "./helpers/renderContext.js";
import { addAttribute, addStatefulAttribute, makeReactiveTextNode, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { Container, container } from "state-party";
import { selectElement } from "helpers/displayElement.js";
import { expect, is, resolvesTo } from "great-expectations";

interface UnsubscribeContext {
  queryCount: number
  container: Container<string>
}

interface MultipleUnsubscribeContext {
  queryCounts: Record<string, number>
  container: Container<string>
}

export default behavior("unsubscribe", [

  example(renderContext<UnsubscribeContext>())
    .description("remove stateful element")
    .script({
      suppose: [
        fact("there is a stateful element", (context) => {
          context.setState({
            queryCount: 0,
            container: container({ initialValue: "tennis" })
          })
          const nestedStatefulChild = makeVirtualElement("section", virtualNodeConfig(), [
            makeStatefulElement(virtualNodeConfig(), (get) => {
              context.state.queryCount++
              const config = virtualNodeConfig()
              addAttribute(config, "class", "funny")
              return makeVirtualElement("div", config, [
                makeVirtualTextNode(`Your favorite sport is: ${get(context.state.container)}`)
              ])
            })
          ])
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            nestedStatefulChild
          ]))
        })
      ],
      observe: [
        effect("the element was displayed", async () => {
          await expect(selectElement(".funny").text(), resolvesTo("Your favorite sport is: tennis"))
        }),
        effect("the query is executed", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the stateful element is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), []))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "running")
        })
      ],
      observe: [
        effect("the query is not executed again", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }),

  example(renderContext<UnsubscribeContext>())
    .description("remove reactive text")
    .script({
      suppose: [
        fact("there is an element with reactive text", (context) => {
          context.setState({
            queryCount: 0,
            container: container({ initialValue: "tennis" })
          })
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeReactiveTextNode((get) => {
              context.state.queryCount++
              return `My favorite sport is ${get(context.state.container)}`
            })
          ]))
        })
      ],
      observe: [
        effect("the text is displayed", async () => {
          await expect(selectElement("div").text(), resolvesTo("My favorite sport is tennis"))
        }),
        effect("the query was executed", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the reactive text is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualTextNode("goodbye")
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "blah")
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("div").text(), resolvesTo("goodbye"))
        }),
        effect("the query is not executed again", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }),

  example(renderContext<MultipleUnsubscribeContext>())
    .description("remove stateful attributes")
    .script({
      suppose: [
        fact("there is an element with reactive text", (context) => {
          context.setState({
            queryCounts: {
              classAttribute: 0,
              dataAttribute: 0
            },
            container: container({ initialValue: "sewing" })
          })
          const config = virtualNodeConfig()
          addStatefulAttribute(config, "class", (get) => {
            context.state.queryCounts["classAttribute"]++
            return `${get(context.state.container)}-style`
          })

          addStatefulAttribute(config, "data-activity", (get) => {
            context.state.queryCounts["dataAttribute"]++
            return get(context.state.container)
          })

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("div", config, [
              makeVirtualTextNode("my activity description")
            ])
          ]))
        })
      ],
      observe: [
        effect("the attributes are set with the initial value", async () => {
          await expect(selectElement(".sewing-style[data-activity='sewing']").exists(), resolvesTo(true))
        }),
        effect("the query was called once for each attribute", (context) => {
          expect(context.state.queryCounts["classAttribute"], is(1))
          expect(context.state.queryCounts["dataAttribute"], is(1))
        })
      ]
    }).andThen({
      perform: [
        step("one attribute is removed when the element is patched", (context) => {
          const config = virtualNodeConfig()
          addStatefulAttribute(config, "data-activity", (get) => {
            context.state.queryCounts["dataAttribute"]++
            return get(context.state.container)
          })

          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("div", config, [
              makeVirtualTextNode("my activity description")
            ])
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "fishing")
        })
      ],
      observe: [
        effect("the removed attribute is not present", async () => {
          const classAttributes = await selectElement("[data-activity='fishing']").attribute("class")
          expect(classAttributes, is(""))
        }),
        effect("the query is only updated for the remaining attribute", (context) => {
          expect(context.state.queryCounts["dataAttribute"], is(2))
          expect(context.state.queryCounts["classAttribute"], is(1))
        })
      ]
    }),

  example(renderContext<MultipleUnsubscribeContext>())
    .description("Add a stateful attribute")
    .script({
      suppose: [
        fact("there is an element and some state", (context) => {
          context.setState({
            queryCounts: {
              classAttribute: 0,
              dataAttribute: 0
            },
            container: container({ initialValue: "reading" })
          })

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("div", virtualNodeConfig(), [
              makeVirtualTextNode("my activity description")
            ])
          ]))
        })
      ],
      perform: [
        step("the element is patched with two stateful attributes", (context) => {
          const config = virtualNodeConfig()
          addStatefulAttribute(config, "class", (get) => {
            context.state.queryCounts["classAttribute"]++
            return `${get(context.state.container)}-style`
          })

          addStatefulAttribute(config, "data-activity", (get) => {
            context.state.queryCounts["dataAttribute"]++
            return get(context.state.container)
          })

          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("div", config, [
              makeVirtualTextNode("my activity descriptions")
            ])
          ]))
        })
      ],
      observe: [
        effect("the attributes are set with the initial value", async () => {
          await expect(selectElement(".reading-style[data-activity='reading']").text(), resolvesTo("my activity descriptions"))
        }),
        effect("the query was called once for each attribute", (context) => {
          expect(context.state.queryCounts["classAttribute"], is(1))
          expect(context.state.queryCounts["dataAttribute"], is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the element is patched to remove a stateful attribute", (context) => {
          const config = virtualNodeConfig()
          addStatefulAttribute(config, "class", (get) => {
            context.state.queryCounts["classAttribute"]++
            return `${get(context.state.container)}-style`
          })

          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("div", config, [
              makeVirtualTextNode("my activity descriptions")
            ])
          ]))
        }),
        step("the container value is updated", (context) => {
          context.writeTo(context.state.container, "gardening")
        })
      ],
      observe: [
        effect("the removed attribute is not present", async () => {
          const classAttributes = await selectElement(".gardening-style").attribute("data-activity")
          expect(classAttributes, is(""))
        }),
        effect("the query is only updated for the remaining attribute", (context) => {
          expect(context.state.queryCounts["dataAttribute"], is(1))
          expect(context.state.queryCounts["classAttribute"], is(2))
        })
      ]
    })

])