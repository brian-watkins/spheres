import { behavior, effect, Example, example, fact, step } from "best-behavior";
import { equalTo, expect, resolvesTo } from "great-expectations";
import { selectElement } from "./helpers/displayElement.js";
import { RenderApp, renderContext } from "./helpers/renderContext.js";
import { Container, container, State, update, use, write } from "@store/index.js";
import { HTMLBuilder, HTMLView } from "@view/index.js";

export default behavior("event handlers", [

  (m) => m.pick() && example(renderContext<Container<number>>())
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

  example(renderContext<Container<number>>())
    .description("event with stateful store message")
    .script({
      suppose: [
        fact("there is state with a number", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view with an event that sends a stateful message to the store", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.children
                .p(el => el.children.textNode(get => `You clicked ${get(context.state)} times!`))
                .button(el => {
                  el.config
                    .dataAttribute("click")
                    .on("click", () => use(get => write(context.state, get(context.state) + 1)))
                  el.children.textNode("Click me!")
                })
            })
          })
        })
      ],
      perform: [
        step("the button is clicked multiple times", async () => {
          await selectElement("button[data-click]").click()
          await selectElement("button[data-click]").click()
          await selectElement("button[data-click]").click()
        })
      ],
      observe: [
        effect("the message updates with the click count", async () => {
          await expect(selectElement("p").text(),
            resolvesTo(equalTo("You clicked 3 times!")))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("event with stateful store message that returns undefined")
    .script({
      suppose: [
        fact("there is state with a number", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view with an event that sends undefined to the store", (context) => {
          context.mountView(root => {
            root.div(el => {
              el.children
                .p(el => el.children.textNode(get => `You clicked ${get(context.state)} times!`))
                .button(el => {
                  el.config
                    .dataAttribute("click")
                    .on("click", () => use(() => undefined))
                  el.children.textNode("Click me!")
                })
            })
          })
        })
      ],
      perform: [
        step("the button is clicked multiple times", async () => {
          await selectElement("button[data-click]").click()
          await selectElement("button[data-click]").click()
          await selectElement("button[data-click]").click()
        })
      ],
      observe: [
        effect("nothing changes", async () => {
          await expect(selectElement("p").text(),
            resolvesTo(equalTo("You clicked 0 times!")))
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
    .description("nested template captures events")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            showFocus: container({ initialValue: false }),
            textMessage: container({ initialValue: "" })
          })
        }),
        fact("there is a nested template that handles the same event type as its parent, with same id", (context) => {
          const nestedZone = (root: HTMLBuilder) => {
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
          }

          context.mountView(root => {
            root.subviews(() => ["yo"], () => zone => {
              zone.div(el => {
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
                  .subviews(() => ["hey"], () => nestedZone)
              })
            })
          })
        })
      ],
      perform: [
        step("click the nested template's button", async () => {
          await selectElement("[data-nested-button]").click()
          await selectElement("[data-nested-button]").click()
          await selectElement("[data-nested-button]").click()
        })
      ],
      observe: [
        effect("the nested template handles the click events", async () => {
          await expect(selectElement("[data-nested-text]").text(), resolvesTo("Clicks: AAA"))
        }),
        effect("the parent template did not receive a click event", async () => {
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
        effect("the nested template did not receive a click", async () => {
          await expect(selectElement("[data-nested-text]").text(), resolvesTo("Clicks: AAA"))
        }),
        effect("the parent template handles the click event", async () => {
          await expect(selectElement("[data-parent-text]").text(), resolvesTo("Clicked the outer button"))
        })
      ]
    }),

  example(renderContext<ListEventContext>())
    .description("zones where each template has event with stateful store message")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            message: container({ initialValue: "" }),
            options: container({ initialValue: ["apples", "candy", "trees", "balloons"] })
          })
        }),
        fact("these is a list of templates and each template has an event that depends on state", (context) => {
          function viewZone(name: State<string>): HTMLView {
            return root =>
              root.li(el => {
                el.children
                  .button(el => {
                    el.config
                      .dataAttribute("button-name", get => get(name))
                      .on("click", () => use(get => {
                        if (get(name) === "trees") {
                          return write(context.state.message, get(name))
                        } else {
                          return undefined
                        }
                      }))
                    el.children.textNode(get => `Click to get ${get(name)}`)
                  })
              })
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .ul(el => {
                  el.children
                    .subviews((get) => get(context.state.options), viewZone)
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
    }).andThen({
      perform: [
        step("click one of the options that returns undefined", async () => {
          await selectElement("[data-button-name='apples']").click()
        })
      ],
      observe: [
        effect("nothing happens", async () => {
          await expect(selectElement("p").text(), resolvesTo("You selected 'trees'"))
        })
      ]
    }),

  elementWithNonBubblingEvent("client", (context, view) => context.mountView(view)),
  elementWithNonBubblingEvent("ssr", (context, view) => context.ssrAndActivate(view)),

  templateInstanceWithNonBubblingEvent("client", (context, view) => context.mountView(view)),
  templateInstanceWithNonBubblingEvent("ssr", (context, view) => context.ssrAndActivate(view)),

])

function elementWithNonBubblingEvent(title: string, renderer: (context: RenderApp<Container<string>>, view: HTMLView) => void): Example {
  return example(renderContext<Container<string>>())
    .description(`element with an event that does not bubble (${title})`)
    .script({
      suppose: [
        fact("there is state that changes with the event", (context) => {
          context.setState(container({ initialValue: "Hello!" }))
        }),
        fact("there is a view with a non-bubbling focus event", (context) => {
          renderer(context, (root) => {
            root.main(el => {
              el.children
                .h3(el => el.children.textNode(get => get(context.state)))
                .form(el => {
                  el.children.label(el => {
                    el.children
                      .textNode("Name")
                      .input(el => {
                        el.config
                          .type("text")
                          .on("focus", () => write(context.state, "Hello! (Focused)"))
                      })
                  })
                })
            })
          })
        })
      ],
      perform: [
        step("trigger the focus event", async () => {
          await selectElement("input").focus()
        })
      ],
      observe: [
        effect("the text updates in response to the event", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Hello! (Focused)"))
        })
      ]
    })
}

function templateInstanceWithNonBubblingEvent(title: string, renderer: (context: RenderApp<ListEventContext>, view: HTMLView) => void): Example {
  return example(renderContext<ListEventContext>())
    .description(`list view where template instance contains non-bubbling event (${title})`)
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            message: container({ initialValue: "Hello" }),
            options: container({ initialValue: ["Name", "Age", "Height"] })
          })
        }),
        fact("there is a list view with a focus event, which does not bubble", (context) => {
          function optionView(option: State<string>): HTMLView {
            return (root) => {
              root.form(el => {
                el.children.label(el => {
                  el.children
                    .textNode(get => get(option))
                    .input(el => {
                      el.config
                        .name(get => get(option).toLowerCase())
                        .on("focus", () => use(get => write(context.state.message, `${get(option)} is focused!`)))
                    })
                })
              })
            }
          }

          renderer(context, (root) => {
            root.main(el => {
              el.children
                .h3(el => el.children.textNode(get => get(context.state.message)))
                .ol(el => {
                  el.children.subviews(get => get(context.state.options), optionView)
                })
            })
          })
        })
      ],
      perform: [
        step("select the age field", async () => {
          await selectElement("input[name='age']").focus()
        })
      ],
      observe: [
        effect("the message updates in response to the focus event", async () => {
          await expect(selectElement("h3").text(), resolvesTo("Age is focused!"))
        })
      ]
    })
}

interface MultipleEventContext {
  showFocus: Container<boolean>
  textMessage: Container<string>
}

interface ListEventContext {
  message: Container<string>
  options: Container<Array<string>>
}
