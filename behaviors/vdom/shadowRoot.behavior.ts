import { behavior, effect, example, fact, step } from "best-behavior"
import { equalTo, expect, resolvesTo } from "great-expectations"
import { selectElement, selectElements } from "./helpers/displayElement.js"
import { renderContext } from "./helpers/renderContext.js"
import { container, Container, update } from "@store/index.js"

interface ShadowRootContext {
  message: Container<string>
}

interface ShadowRootCounterContext {
  counter: Container<number>
}

interface ShadowRootListContext {
  items: Container<Array<string>>
  counter: Container<number>
}

export default behavior("shadow root", [
  example(renderContext<ShadowRootContext>())
    .description("element with a shadow root and light dom children")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Hello!" }),
          })
        }),
        fact(
          "a view with a shadow root that slots its light dom children is mounted",
          (context) => {
            context.mountView((root) => {
              root.div((el) => {
                el.config.shadowRoot((el) => {
                  el.config.shadowrootmode("open")
                  el.children.p((el) => el.children.textNode("In the shadows!")).slot()
                })
                el.children.p((el) => {
                  el.config.dataAttribute("message")
                  el.children.textNode((get) => get(context.state.message))
                })
              })
            })
          },
        ),
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.message, "Goodbye!")
        }),
      ],
      observe: [
        effect("the light dom child is displayed in the slot", async () => {
          await expect(selectElement("[data-message]").isVisible(), resolvesTo(true))
        }),
        effect("the stateful text in the light dom child is updated", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo(equalTo("Goodbye!")))
        }),
      ],
    }),

  example(renderContext<ShadowRootCounterContext>())
    .description("stateful text inside a shadow root")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            counter: container({ initialValue: 0 }),
          })
        }),
        fact("a view with a counter inside a shadow root is mounted", (context) => {
          context.mountView((root) => {
            root.main((el) => {
              el.children
                .div((el) => {
                  el.config.shadowRoot((el) => {
                    el.config.shadowrootmode("open")
                    el.children.p((el) => {
                      el.config.dataAttribute("counter")
                      el.children.textNode((get) => `Count: ${get(context.state.counter)}`)
                    })
                  })
                })
                .button((el) => {
                  el.config.on("click", () => update(context.state.counter, (count) => count + 1))
                  el.children.textNode("Increment")
                })
            })
          })
        }),
      ],
      perform: [
        step("the button outside the shadow root is clicked twice", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the counter inside the shadow root is updated", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo(equalTo("Count: 2")))
        }),
      ],
    }),

  example(renderContext<ShadowRootCounterContext>())
    .description("click event inside an open shadow root")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            counter: container({ initialValue: 0 }),
          })
        }),
        fact("a view with a button inside an open shadow root is mounted", (context) => {
          context.mountView((root) => {
            root.main((el) => {
              el.config.shadowRoot((el) => {
                el.config.shadowrootmode("open")
                el.children
                  .p((el) => {
                    el.config.dataAttribute("counter")
                    el.children.textNode((get) => `Count: ${get(context.state.counter)}`)
                  })
                  .button((el) => {
                    el.config.on("click", () => update(context.state.counter, (count) => count + 1))
                    el.children.textNode("Increment")
                  })
              })
            })
          })
        }),
      ],
      perform: [
        step("the button inside the shadow root is clicked twice", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the counter is updated", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo(equalTo("Count: 2")))
        }),
      ],
    }),

  example(renderContext<ShadowRootCounterContext>())
    .description("activating stateful text inside a server rendered shadow root")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            counter: container({ initialValue: 16 }),
          })
        }),
        fact("a view with a counter inside a shadow root is rendered and activated", (context) => {
          context.ssrAndActivate((root) => {
            root.div((el) => {
              el.config.shadowRoot((el) => {
                el.config.shadowrootmode("open")
                el.children.p((el) => {
                  el.config.dataAttribute("counter")
                  el.children.textNode((get) => `Count: ${get(context.state.counter)}`)
                })
              })
            })
          })
        }),
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.counter, 17)
        }),
      ],
      observe: [
        effect("the counter inside the shadow root is updated", async () => {
          await expect(selectElement("[data-counter]").text(), resolvesTo(equalTo("Count: 17")))
        }),
      ],
    }),

  example(renderContext())
    .description("server rendered shadow root with no mode specified")
    .script({
      suppose: [
        fact(
          "a view with a shadow root that does not specify a mode is rendered and activated",
          (context) => {
            context.ssrAndActivate((root) => {
              root.div((el) => {
                el.config.shadowRoot((el) => {
                  el.children.p((el) => {
                    el.config.dataAttribute("shadow-content")
                    el.children.textNode("In the shadows!")
                  })
                })
              })
            })
          },
        ),
      ],
      observe: [
        effect("the content of the open shadow root is displayed", async () => {
          await expect(
            selectElement("[data-shadow-content]").text(),
            resolvesTo(equalTo("In the shadows!")),
          )
        }),
      ],
    }),

  example(renderContext())
    .description("client rendered shadow root with no mode specified")
    .script({
      suppose: [
        fact("a view with a shadow root that does not specify a mode is mounted", (context) => {
          context.mountView((root) => {
            root.div((el) => {
              el.config.shadowRoot((el) => {
                el.children.p((el) => {
                  el.config.dataAttribute("shadow-content")
                  el.children.textNode("In the shadows!")
                })
              })
            })
          })
        }),
      ],
      observe: [
        effect("the content of the open shadow root is displayed", async () => {
          await expect(
            selectElement("[data-shadow-content]").text(),
            resolvesTo(equalTo("In the shadows!")),
          )
        }),
      ],
    }),

  example(renderContext())
    .description("shadow root that delegates focus")
    .script({
      suppose: [
        fact("a view with a shadow root that delegates focus is mounted", (context) => {
          context.mountView((root) => {
            root.div((el) => {
              el.config.dataAttribute("host")
              el.config.shadowRoot((el) => {
                el.config.shadowrootdelegatesfocus(true)
                el.children.input((el) => {
                  el.config.dataAttribute("shadow-input")
                })
              })
            })
          })
        }),
      ],
      perform: [
        step("the shadow host is focused", async () => {
          await selectElement("[data-host]").focus()
        }),
      ],
      observe: [
        effect("focus is delegated to the input inside the shadow root", async () => {
          await expect(selectElement("[data-shadow-input]").isFocused(), resolvesTo(true))
        }),
      ],
    }),

  example(renderContext<ShadowRootListContext>())
    .description("activating stateful text inside shadow roots of server rendered list items")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["item-1", "item-2"] }),
            counter: container({ initialValue: 0 }),
          })
        }),
        fact(
          "a list whose items have a shadow root with stateful text is rendered and activated",
          (context) => {
            context.ssrAndActivate((root) => {
              root.ul((el) => {
                el.children.subviews(
                  (get) => get(context.state.items),
                  () => (root) => {
                    root.li((el) => {
                      el.children.div((el) => {
                        el.config.shadowRoot((el) => {
                          el.children.p((el) => {
                            el.config.dataAttribute("counter")
                            el.children.textNode((get) => `Count: ${get(context.state.counter)}`)
                          })
                        })
                      })
                    })
                  },
                )
              })
            })
          },
        ),
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.counter, 2)
        }),
      ],
      observe: [
        effect("the counter inside each shadow root is updated", async () => {
          await expect(
            selectElements("[data-counter]").texts(),
            resolvesTo(["Count: 2", "Count: 2"]),
          )
        }),
      ],
    }),
])
