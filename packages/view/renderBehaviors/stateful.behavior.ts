import { Container, container } from "@spheres/store";
import { addStatefulAttribute, addStatefulProperty, makeBlockElement, makeStatefulElement, makeStatefulTextNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { renderContext } from "helpers/renderContext";

interface StatefulTestContext {
  container: Container<number>
  callCount: number
}

export default behavior("stateful views", [

  example(renderContext<StatefulTestContext>())
    .description("stateful text that is removed")
    .script({
      suppose: [
        fact("there is a view with stateful text", (context) => {
          const data: StatefulTestContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }

          context.setState(data)

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeStatefulTextNode((get) => {
              data.callCount++
              return `This is the count: ${get(data.container)}`
            })
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the stateful text is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualTextNode("This is just static text.")
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }),

  example(renderContext<StatefulTestContext>())
    .description("stateful element that is removed")
    .script({
      suppose: [
        fact("there is a view with a stateful element", (context) => {
          const data: StatefulTestContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }

          context.setState(data)

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeStatefulElement((get) => {
              data.callCount++
              return makeVirtualElement("p", virtualNodeConfig(), [
                makeVirtualTextNode(`This is the count: ${get(data.container)}`)
              ])
            }, undefined)
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the stateful element is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("p", virtualNodeConfig(), [
              makeVirtualTextNode("This is just some static text.")
            ])
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }),

  example(renderContext<StatefulTestContext>())
    .description("block with an element that has reactive text")
    .script({
      suppose: [
        fact("there is a block view with an element that has reactive text", (context) => {
          const data: StatefulTestContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }

          context.setState(data)

          context.mount(makeVirtualElement("main", virtualNodeConfig(), [
            makeVirtualTextNode("Here is some extra text"),
            makeBlockElement(() => {
              return makeVirtualElement("p", virtualNodeConfig(), [
                makeStatefulTextNode((get) => {
                  data.callCount++
                  return `Cool things: ${get(data.container)}`
                })
              ])
            }, "my-key")
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched", (context) => {
          context.patch(makeVirtualElement("main", virtualNodeConfig(), [
            makeBlockElement(() => {
              return makeVirtualElement("p", virtualNodeConfig(), [
                makeStatefulTextNode((get) => {
                  context.state.callCount++
                  return `Cool things: ${get(context.state.container)}`
                })
              ])
            }, "my-key")
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the block element is removed", (context) => {
          context.patch(makeVirtualElement("main", virtualNodeConfig(), []))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }),

  example(renderContext<StatefulTestContext>())
    .description("block with an element that has a reactive attribute")
    .script({
      suppose: [
        fact("there is a block view with an element that has a reactive attribute", (context) => {
          const data: StatefulTestContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }

          context.setState(data)

          const elementConfig = virtualNodeConfig()
          addStatefulAttribute(elementConfig, "data-fun-stuff", (get) => {
            data.callCount++
            return `thing-${get(data.container)}`
          })

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeBlockElement(() => {
              return makeVirtualElement("div", elementConfig, [
                makeVirtualTextNode("Hello!")
              ])
            }, undefined)
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the block element is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), []))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }),

  example(renderContext<StatefulTestContext>())
    .description("block with an element that has a reactive property")
    .script({
      suppose: [
        fact("there is a block view with an element that has a reactive property", (context) => {
          const data: StatefulTestContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }

          context.setState(data)

          const elementConfig = virtualNodeConfig()
          addStatefulProperty(elementConfig, "className", (get) => {
            data.callCount++
            return `thing-${get(data.container)}`
          })

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeBlockElement(() => {
              return makeVirtualElement("div", elementConfig, [
                makeVirtualTextNode("Hello!")
              ])
            }, undefined)
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the block element is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), []))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    })

])