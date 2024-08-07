import { addAttribute, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setEventHandler, virtualNodeConfig, WithArgs } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElement } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";
import { Container, container, GetState, rule, update, use, write } from "@spheres/store";
import { htmlTemplate } from "@src/htmlViewBuilder";

export default behavior("event handlers", [

  example(renderContext<Container<number>>())
    .description("mount an element with an event handler")
    .script({
      suppose: [
        fact("there is state that tracks the number of clicks", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there are elements with click events", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.children
                .p(el => el.children.textNode(get => `You clicked ${get(context.state)} times!`))
                .button(el => {
                  el.config
                    .dataAttribute("click-one")
                    .on("click", () => update(context.state, (current) => current + 1))
                  el.children.textNode("Click me!")
                })
                .button(el => {
                  el.config
                    .dataAttribute("click-ten")
                    .on("click", () => update(context.state, (current) => current + 10))
                  el.children.textNode("Click me for 10!")
                })
            })
          })
        })
      ],
      perform: [
        step("the button is clicked multiple times", async () => {
          await selectElement("button[data-click-one]").click()
          await selectElement("button[data-click-ten]").click()
          await selectElement("button[data-click-one]").click()
        })
      ],
      observe: [
        effect("the message updates with the click count", async () => {
          await expect(selectElement("p").text(),
            resolvesTo(equalTo("You clicked 12 times!")))
        })
      ]
    }),

  example(renderContext<MultipleEventContext>())
    .description("mount an element with multiple event handlers")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            showFocus: container({ initialValue: false }),
            textMessage: container({ initialValue: "" })
          })
        }),
        fact("there is an element with focus and input events", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.children
                .h3(el => el.children.textNode(get => get(context.state.showFocus) ? "Type a message!" : "Click in the field, please!"))
                .input(el => {
                  el.config
                    .on("focusin", () => write(context.state.showFocus, true))
                    .on("focusout", () => write(context.state.showFocus, false))
                    .on("input", (evt) => write(context.state.textMessage, (evt.target as HTMLInputElement).value))
                })
                .hr()
                .p(el => el.children.textNode(get => `You typed: '${get(context.state.textMessage)}'`))
            })
          })
        })
      ],
      observe: [
        effect("the focus message is off", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Click in the field, please!"))
        })
      ]
    }).andThen({
      perform: [
        step("focus the input field", async () => {
          await selectElement("input").click()
        })
      ],
      observe: [
        effect("the focus message is on", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Type a message!"))
        }),
        effect("there is no typed text", async () => {
          await expect(selectElement("p").text(), resolvesTo("You typed: ''"))
        })
      ]
    }).andThen({
      perform: [
        step("type some text", async () => {
          await selectElement("input").type("This is something funny!")
        })
      ],
      observe: [
        effect("the typed text shows up in the message area", async () => {
          await expect(selectElement("p").text(), resolvesTo("You typed: 'This is something funny!'"))
        })
      ]
    }).andThen({
      perform: [
        step("the input field loses focus", async () => {
          await selectElement("p").click()
        })
      ],
      observe: [
        effect("the focus message is off", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Click in the field, please!"))
        })
      ]
    }),

  example(renderContext<MultipleEventContext>())
    .description("event is dispatched and handled by parent; other elements in hierarchy handle other events")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            showFocus: container({ initialValue: false }),
            textMessage: container({ initialValue: "" })
          })
        }),
        fact("there is an element with an input event and a parent that handles click event", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.config
                .on("click", () => write(context.state.showFocus, true))
              el.children
                .h3(el => el.children.textNode(get => get(context.state.showFocus) ? "Type a message!" : "Click in the field, please!"))
                .input(el => {
                  el.config
                    .on("input", (evt) => write(context.state.textMessage, (evt.target as HTMLInputElement).value))
                })
                .hr()
                .p(el => el.children.textNode(get => `You typed: '${get(context.state.textMessage)}'`))
            })
          })
        })
      ],
      perform: [
        step("dispatch click event from input element", async () => {
          await selectElement("input").click()
        }),
        step("type in the input field", async () => {
          await selectElement("input").type("Good morning!")
        })
      ],
      observe: [
        effect("the click event was handled by the parent element", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Type a message!"))
        }),
        effect("the input event was handled by the input element", async () => {
          await expect(selectElement("P").text(), resolvesTo("You typed: 'Good morning!'"))
        })
      ]
    }),

  example(renderContext<MultipleEventContext>())
    .description("nested zone captures events")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            showFocus: container({ initialValue: false }),
            textMessage: container({ initialValue: "" })
          })
        }),
        fact("there is a nested zone that handles the same event type as its parent, with same id", (context) => {
          const nestedZone = htmlTemplate(() => root => {
            root.div(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("nested-text")
                  el.children.textNode((get) => `Clicks: ${get(context.state.textMessage)}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("nested-button")
                    .on("click", () => update(context.state.textMessage, (val) => `${val}A`))
                  el.children.textNode("Nested Zone Button")
                })
            })
          })

          context.mountView(root => {
            root.div(el => {
              el.children
                .h3(el => {
                  el.config.dataAttribute("parent-text")
                  el.children.textNode(get => get(context.state.showFocus) ? "Clicked the outer button" : "No clicks on outer button!")
                })
                .button(el => {
                  el.config
                    .dataAttribute("parent-button")
                    .on("click", () => write(context.state.showFocus, true))
                  el.children.textNode("Parent Button")
                })
                .zone(nestedZone())
            })
          })
        })
      ],
      perform: [
        step("click the nested zone's button", async () => {
          await selectElement("[data-nested-button]").click()
          await selectElement("[data-nested-button]").click()
          await selectElement("[data-nested-button]").click()
        })
      ],
      observe: [
        effect("the nested zone handles the click events", async () => {
          await expect(selectElement("[data-nested-text]").text(), resolvesTo("Clicks: AAA"))
        }),
        effect("the parent zone did not receive a click event", async () => {
          await expect(selectElement("[data-parent-text]").text(), resolvesTo("No clicks on outer button!"))
        })
      ]
    }).andThen({
      perform: [
        step("click the outer button", async () => {
          await selectElement("[data-parent-button]").click()
        })
      ],
      observe: [
        effect("the nested zone did not receive a click", async () => {
          await expect(selectElement("[data-nested-text]").text(), resolvesTo("Clicks: AAA"))
        }),
        effect("the parent zone handles the click event", async () => {
          await expect(selectElement("[data-parent-text]").text(), resolvesTo("Clicked the outer button"))
        })
      ]
    }),

  example(renderContext<ListEventContext>())
    .description("zones where each zone has events")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            message: container({ initialValue: "" }),
            options: container({ initialValue: [ "apples", "candy", "trees", "balloons" ] })
          })
        }),
        fact("these is a list of zones and each zone has an event that depends on args", (context) => {
          const setNameValue = rule((get, getName: (get: GetState) => string) => {
            return write(context.state.message, getName(get))
          })

          const viewZone = htmlTemplate((withArgs: WithArgs<string>) => root => {
            root.li(el => {
              el.children
                .button(el => {
                  el.config
                    .dataAttribute("button-name", withArgs(name => name))
                    .on("click", () => use(setNameValue, withArgs(name => name)))
                  el.children.textNode(withArgs(name => `Click to get ${name}`))
                })
            })
          })

          context.mountView(root => {
            root.main(el => {
              el.children
                .ul(el => {
                  el.children
                    .zones((get) => get(context.state.options), viewZone)
                })
                .hr()
                .p(el => {
                  el.children.textNode(get => `You selected '${get(context.state.message)}'`)
                })
            })
          })
        })
      ],
      perform: [
        step("click one of the options in the list", async () => {
          await selectElement("[data-button-name='trees']").click()
        })
      ],
      observe: [
        effect("the event is handled and the message is updated", async () => {
          await expect(selectElement("p").text(), resolvesTo("You selected 'trees'"))
        })
      ]
    }),

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
            update: (amount, current) => {
              return { value: current + amount }
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

interface MultipleEventContext {
  showFocus: Container<boolean>
  textMessage: Container<string>
}

interface ListEventContext {
  message: Container<string>
  options: Container<Array<string>>
}