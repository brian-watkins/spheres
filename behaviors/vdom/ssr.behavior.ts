import { container, Container, derived, State, update } from "@store/index.js";
import { HTMLView, svg, SVGBuilder, SVGView } from "@view/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo, is, stringContaining } from "great-expectations";
import { selectElement, selectElements } from "./helpers/displayElement";
import { renderContext } from "./helpers/renderContext";

interface SimpleListContext {
  items: Container<Array<string>>
}

interface ListContext {
  options: Container<Array<string>>
  message: Container<string>
}

interface BasicContext {
  message: Container<string>
}

export default behavior("ssr", [

  example(renderContext<BasicContext>())
    .description("activating ssr with boolean attributes")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Yo!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          context.ssrAndActivate(root => {
            root.form(el => {
              el.children.select(el => {
                el.children
                  .option(el => {
                    el.config.selected(false)
                    el.children.textNode("one")
                  })
                  .option(el => {
                    el.config
                      .selected(true)
                      .value("Second Thing")
                    el.children.textNode("two")
                  })
                  .option(el => {
                    el.config.selected(false)
                    el.children.textNode("three")
                  })
              })
            })
          })
        })
      ],
      observe: [
        effect("the selected attribute is present on the second item only", async () => {
          await expect(selectElements("[selected]").texts(), resolvesTo([
            "two"
          ]))
        }),
        effect("the correct item is selected", async () => {
          await expect(selectElement("select").inputValue(), resolvesTo("Second Thing"))
        })
      ]
    }),

  example(renderContext<BasicContext>())
    .description("activating ssr aria attribute")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Yo!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          context.ssrAndActivate(root => {
            root.div(el => {
              el.config
                .aria("label", get => get(context.state.message))
                .aria("disabled", "false")
              el.children.textNode("Hello!")
            })
          })
        })
      ],
      observe: [
        effect("the aria attributes are rendered", async () => {
          await expect(selectElement("div").attribute("aria-label"), resolvesTo("Yo!"))
          await expect(selectElement("div").attribute("aria-disabled"), resolvesTo("false"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", context => {
          context.writeTo(context.state.message, "Cool!")
        })
      ],
      observe: [
        effect("the reactive aria attribute updates", async () => {
          await expect(selectElement("div").attribute("aria-label"), resolvesTo("Cool!"))
        })
      ]
    }),

  example(renderContext<BasicContext>())
    .description("activating ssr inner html")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Nice!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          context.ssrAndActivate(root => {
            root.main(el => {
              el.children
                .h2(el => {
                  el.config.innerHTML("<em>Awesome!</em>")
                })
                .div(el => {
                  el.config
                    .innerHTML(get => `<p>${get(context.state.message)}</p>`)
                })
            })
          })
        })
      ],
      observe: [
        effect("the inner html is rendered", async () => {
          await expect(selectElement("main h2 em").text(), resolvesTo("Awesome!"))
          await expect(selectElement("main div p").text(), resolvesTo("Nice!"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", context => {
          context.writeTo(context.state.message, "Super!!")
        })
      ],
      observe: [
        effect("the reactive inner html updates", async () => {
          await expect(selectElement("main div p").text(), resolvesTo("Super!!"))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("activating ssr list items with stateful text, attribute, property")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            options: container({ initialValue: ["a", "b", "c"] }),
            message: container({ initialValue: "hello" })
          })
        }),
        fact("there is a ssr list with stateful text", (context) => {
          function itemView(state: State<string>): HTMLView {
            return root => {
              root.p(el => {
                el.config
                  .dataAttribute("stateful-text", get => get(context.state.message))
                  .class(get => `text-${get(context.state.message)}`)
                el.children.textNode(get => `${get(context.state.message)} ${get(state)}`)
              })
            }
          }

          context.ssrAndActivate((root) => {
            root.div(el => [
              el.children
                .div(el => {
                  el.children.subviews(get => get(context.state.options), itemView)
                })
            ])
          })
        })
      ],
      observe: [
        effect("the default text is rendered on the server", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.text()), resolvesTo([
            "hello a", "hello b", "hello c"
          ]))
        }),
        effect("the default data attribute is rendered on the server", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo([
            "hello", "hello", "hello"
          ]))
        }),
        effect("the default class property is activated on the client", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo([
            "text-hello", "text-hello", "text-hello"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.message, "Yo")
        })
      ],
      observe: [
        effect("the stateful texts update", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.text()), resolvesTo([
            "Yo a", "Yo b", "Yo c"
          ]))
        }),
        effect("the data attribute updates", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo([
            "Yo", "Yo", "Yo"
          ]))
        }),
        effect("the class property updates", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo([
            "text-Yo", "text-Yo", "text-Yo"
          ]))
        })
      ]
    }),

  example(renderContext<SimpleListContext>())
    .description("activate list items with inner state")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["Sweet!", "Awesome!", "Cool!"] })
          })
        }),
        fact("a view with items with inner state is activated", (context) => {
          function itemView(state: State<string>, index: State<number>): HTMLView {
            const counter = container({ initialValue: 0 })
            const counterName = derived(get => {
              return `[${get(state).toLowerCase().slice(0, -1)}-${get(index) + 1}]`
            })

            return root => {
              root.div(el => {
                el.children
                  .h2(el => {
                    el.children.textNode(get => get(state))
                  })
                  .p(el => {
                    el.config.dataAttribute("click-count")
                    el.children.textNode(get => `You clicked ${get(counterName)} ${get(counter)} times.`)
                  })
                  .button(el => {
                    el.config
                      .on("click", () => update(counter, (val) => val + 1))
                    el.children.textNode("Increment")
                  })
              })
            }
          }

          context.ssrAndActivate((root) => {
            root.div(el => [
              el.children
                .div(el => {
                  el.children.subviews(get => get(context.state.items), itemView)
                })
            ])
          })
        })
      ],
      observe: [
        effect("the ssr html has the correct state", (context) => {
          expect(context.ssrHtmlString, is(stringContaining("You clicked [sweet-1] 0 times.")))
          expect(context.ssrHtmlString, is(stringContaining("You clicked [awesome-2] 0 times.")))
          expect(context.ssrHtmlString, is(stringContaining("You clicked [cool-3] 0 times.")))
        }),
        effect("the items are rendered in the dom (activated) with the default state", async () => {
          await expect(selectElements("[data-click-count]").texts(), resolvesTo([
            "You clicked [sweet-1] 0 times.",
            "You clicked [awesome-2] 0 times.",
            "You clicked [cool-3] 0 times."
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click the second button", async () => {
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
        }),
        step("click the third button", async () => {
          await selectElements("button").at(2).click()
          await selectElements("button").at(2).click()
          await selectElements("button").at(2).click()
        })
      ],
      observe: [
        effect("the labels reflect the number of clicks", async () => {
          await expect(selectElements("[data-click-count]").texts(), resolvesTo([
            "You clicked [sweet-1] 0 times.",
            "You clicked [awesome-2] 2 times.",
            "You clicked [cool-3] 3 times."
          ]))
        })
      ]
    }),

  example(renderContext<BasicContext>())
    .description("activating ssr svg elements")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Nice!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          function circle(root: SVGBuilder) {
            root.text(({ config, children }) => {
              config
                .x("150")
                .y("125")
                .fontSize("60")
                .fontWeight("bold")
                .textAnchor("middle")
                .fill("white")
              children
                .textNode(get => get(context.state.message))
            })
          }

          context.ssrAndActivate(root => {
            root.main(el => {
              el.children
                .subview(svg(({ config, children }) => {
                  config
                    .width("300")
                    .height("200")
                    .class("some-fun-drawing")

                  children
                    .rect(({ config }) => [
                      config
                        .width("100%")
                        .height("100%")
                        .fill("red")
                    ])
                    .circle(({ config }) => {
                      config
                        .cx("150")
                        .cy("100")
                        .r("80")
                        .fill("green")
                    })
                    .subview(circle)
                }))
            })
          })
        })
      ],
      observe: [
        effect("the svg attributes are rendered", async () => {
          await expect(selectElement("TEXT").attribute("font-weight"), resolvesTo("bold"))
        }),
        effect("the text is rendered", async () => {
          await expect(selectElement("TEXT").text(), resolvesTo("Nice!"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.message, "Wow!")
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("TEXT").text(), resolvesTo("Wow!"))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("activating ssr svg list")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            options: container({ initialValue: ["a", "b", "c"] }),
            message: container({ initialValue: "Nice!" })
          })
        }),
        fact("a view with svg list is activated", (context) => {
          function circle(option: State<string>, index: State<number>): SVGView {
            return root =>
              root.g(el => {
                el.children.
                  circle(el => {
                    el.config
                      .cx(get => `${get(index) * 150 + 150}`)
                      .cy("100")
                      .r("80")
                      .fill("green")
                      .fillOpacity("0.7")
                  })
                  .text(({ config, children }) => {
                    config
                      .x(get => `${get(index) * 150 + 150}`)
                      .y("125")
                      .fontSize("60")
                      .fontWeight("bold")
                      .textAnchor("middle")
                      .fill("white")
                    children
                      .textNode(get => get(option))
                  })
              })
          }

          context.ssrAndActivate(root => {
            root.main(el => {
              el.children
                .subview(svg(({ config, children }) => {
                  config
                    .width("900")
                    .height("200")
                    .class("some-fun-drawing")

                  children
                    .rect(({ config }) => [
                      config
                        .width("100%")
                        .height("100%")
                        .fill("red")
                    ])
                    .subviews(get => get(context.state.options), circle)
                }))
            })
          })
        })
      ],
      observe: [
        effect("the svg attributes are rendered", async () => {
          await expect(selectElements("TEXT").map(el => el.attribute("font-weight")), resolvesTo([
            "bold", "bold", "bold"
          ]))
        }),
        effect("the text is rendered", async () => {
          await expect(selectElements("TEXT").map(el => el.text()), resolvesTo([
            "a", "b", "c"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.options, ["a", "c", "d", "b", "e"])
        })
      ],
      observe: [
        effect("the svg attributes are rendered", async () => {
          await expect(selectElements("TEXT").map(el => el.attribute("font-weight")), resolvesTo([
            "bold", "bold", "bold", "bold", "bold"
          ]))
        }),
        effect("the text is rendered", async () => {
          await expect(selectElements("TEXT").map(el => el.text()), resolvesTo([
            "a", "c", "d", "b", "e"
          ]))
        })
      ]
    })

])
