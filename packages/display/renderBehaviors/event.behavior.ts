import { addAttribute, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setEventHandler, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElement } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";
import { Container, container, rule, use, write } from "@spheres/store";

export default behavior("event handlers", [

  example(renderContext<Container<number>>())
    .description("mount an element with an event handler")
    .script({
      suppose: [
        fact("there is state that tracks the number of clicks", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is an element with a click event", (context) => {
          const config = virtualNodeConfig()
          setEventHandler(config, "click", () => {
            return use(rule((get) => write(context.state, get(context.state) + 1)))
          })
          const button = makeVirtualElement("button", config, [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`You clicked the button ${get(context.state)} times!`)
            ])
          }, undefined)
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        })
      ],
      perform: [
        step("the button is clicked", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the message updates with the click count", async () => {
          await expect(selectElement("[data-message]").text(),
            resolvesTo(equalTo("You clicked the button 3 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the element is patched to remove the event handler", (context) => {
          const button = makeVirtualElement("button", virtualNodeConfig(), [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`You clicked the button ${get(context.state)} times!`)
            ])
          }, undefined)
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        }),
        step("the button is clicked some more times", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the click counter does not change", async () => {
          await expect(selectElement("[data-message]").text(),
            resolvesTo(equalTo("You clicked the button 3 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the element is patched to add the event handler back", (context) => {
          const config = virtualNodeConfig()
          setEventHandler(config, "click", () => {
            return use(rule((get) => write(context.state, get(context.state) + 1)))
          })
          const button = makeVirtualElement("button", config, [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`You clicked the button ${get(context.state)} times!`)
            ])
          }, undefined)
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        }),
        step("the button is clicked some more times", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the click counter updates", async () => {
          await expect(selectElement("[data-message]").text(),
            resolvesTo(equalTo("You clicked the button 4 times!")))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("event handler function that changes during patch")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState(container({
            initialValue: 0,
            reducer: (amount, current) => {
              return current + amount
            }
          }))
        }),
        fact("there is an element with a click event handler", (context) => {
          const config = virtualNodeConfig()
          setEventHandler(config, "click", () => {
            return write(context.state, 1)
          })
          const button = makeVirtualElement("button", config, [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`Here is your total: ${get(context.state)}`)
            ])
          }, undefined)
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        })
      ],
      perform: [
        step("the button is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the message is updated", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo("Here is your total: 1"))
        })
      ]
    }).andThen({
      perform: [
        step("the event handler function is patched", (context) => {
          const config = virtualNodeConfig()
          setEventHandler(config, "click", () => {
            return write(context.state, 3)
          })
          const button = makeVirtualElement("button", config, [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`Here is your total: ${get(context.state)}`)
            ])
          }, undefined)
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        }),
        step("the button is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the message is updated", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo("Here is your total: 4"))
        })
      ]
    }).andThen({
      perform: [
        step("the event handler function is removed", (context) => {
          const button = makeVirtualElement("button", virtualNodeConfig(), [
            makeVirtualTextNode("Click me!")
          ])
          const message = makeStatefulElement((get) => {
            const messageConfig = virtualNodeConfig()
            addAttribute(messageConfig, "data-message", "true")
            return makeVirtualElement("p", messageConfig, [
              makeVirtualTextNode(`Here is your total: ${get(context.state)}`)
            ])
          }, undefined)
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            message,
            button
          ]))
        }),
        step("the button is clicked twice", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the message does not update", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo("Here is your total: 4"))
        })
      ]
    })

])