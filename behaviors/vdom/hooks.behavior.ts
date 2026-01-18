import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { container, derived, State, update, useContainerHooks, useHooks, write } from "@store/index";
import { HTMLBuilder, HTMLView, UseData } from "@view/index";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, is, resolvesTo } from "great-expectations";

export default behavior("onRegister hook", [

  example(renderContext<HooksContext>())
    .description("list item view tokens trigger onRegister hook")
    .script({
      suppose: [
        fact("context is initialized", (context) => {
          context.setState({ logs: [] })
        }),
        fact("onRegister hook is used to add a container hook to each container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              const containerName = container.id !== undefined ?
                `${container}-${actions.get(container.id)}` :
                `${container}`
              context.state.logs.push(`Registering [${containerName}]`)
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  context.state.logs.push(`Writing [${containerName}] => ${JSON.stringify(message)}`)
                  actions.ok(message)
                },
              })
            },
          })
        }),
        fact("a list of elements is displayed", (context) => {
          const items = container({
            name: "list-data",
            initialValue: ["One", "Two", "Three"]
          })

          function itemView(useItem: UseData<string>): HTMLView {
            const counter = container({
              name: "counter",
              initialValue: 0,
              id: derived(useItem(item => item.toLowerCase()))
            })

            return root => {
              root.div(el => {
                el.children
                  .h1(el => {
                    el.children
                      .textNode(useItem(item => item))
                      .textNode(" - ")
                      .textNode(get => `${get(counter)} clicks`)
                  })
                  .button(el => {
                    el.config.on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Increment")
                  })
                  .hr()
              })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .subviews(get => get(items), itemView)
            })
          })
        })
      ],
      perform: [
        step("click some buttons", async () => {
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
        })
      ],
      observe: [
        effect("the view updates", async () => {
          await expect(selectElements("h1").texts(), resolvesTo([
            "One - 0 clicks",
            "Two - 3 clicks",
            "Three - 0 clicks",
          ]))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [list-data]",
            "Registering [counter-one]",
            "Registering [counter-two]",
            "Registering [counter-three]",
            "Writing [counter-two] => 1",
            "Writing [counter-two] => 2",
            "Writing [counter-two] => 3",
          ]))
        })
      ]
    }),

  example(renderContext<HooksContext>())
    .description("conditional view tokens trigger onRegister hook")
    .script({
      suppose: [
        fact("context is initialized", (context) => {
          context.setState({ logs: [] })
        }),
        fact("onRegister hook is used to add a container hook to each container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              const containerName = container.id !== undefined ?
                `${container}-${actions.get(container.id)}` :
                `${container}`
              context.state.logs.push(`Registering [${containerName}]`)
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  context.state.logs.push(`Writing [${containerName}] => ${JSON.stringify(message)}`)
                  actions.ok(message)
                },
              })
            },
          })
        }),
        fact("a conditional view is displayed", (context) => {
          const trigger = container({ name: "trigger", initialValue: false })

          function initialView(root: HTMLBuilder) {
            const counter = container({ name: "initial-counter", initialValue: 0 })

            root.div(el => {
              el.children
                .h1(el => {
                  el.children.textNode(get => `Initial clicks: ${get(counter)}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("initial-counter")
                    .on("click", () => update(counter, val => val + 1))
                  el.children.textNode("Click!")
                })
            })
          }

          function mainView(root: HTMLBuilder) {
            const counter = container({ name: "main-counter", initialValue: 0 })

            root.div(el => {
              el.children
                .h1(el => {
                  el.children.textNode(get => `Main clicks: ${get(counter)}`)
                })
                .button(el => {
                  el.config
                    .dataAttribute("main-counter")
                    .on("click", () => update(counter, val => val + 1))
                  el.children.textNode("Click!")
                })
            })
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withConditions()
                    .when(get => get(trigger), mainView)
                    .when(get => !get(trigger), initialView)
                })
                .hr()
                .button(el => {
                  el.config
                    .dataAttribute("view-trigger")
                    .on("click", () => update(trigger, val => !val))
                  el.children.textNode("Switch View")
                })
            })
          })
        })
      ],
      perform: [
        step("update the initial counter", async () => {
          await selectElement("button[data-initial-counter]").click()
          await selectElement("button[data-initial-counter]").click()
        })
      ],
      observe: [
        effect("the initial counter updates", async () => {
          await expect(selectElement("h1").text(), resolvesTo("Initial clicks: 2"))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [trigger]",
            "Registering [initial-counter]",
            "Writing [initial-counter] => 1",
            "Writing [initial-counter] => 2",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("trigger a different view to appear", async () => {
          await selectElement("button[data-view-trigger]").click()
        }),
        step("update the counter", async () => {
          await selectElement("button[data-main-counter]").click()
          await selectElement("button[data-main-counter]").click()
          await selectElement("button[data-main-counter]").click()
          await selectElement("button[data-main-counter]").click()
        })
      ],
      observe: [
        effect("the main counter is updated", async () => {
          await expect(selectElement("h1").text(), resolvesTo("Main clicks: 4"))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [trigger]",
            "Registering [initial-counter]",
            "Writing [initial-counter] => 1",
            "Writing [initial-counter] => 2",
            "Writing [trigger] => true",
            "Registering [main-counter]",
            "Writing [main-counter] => 1",
            "Writing [main-counter] => 2",
            "Writing [main-counter] => 3",
            "Writing [main-counter] => 4",
          ]))
        })
      ]
    }),

  example(renderContext<HooksContext>())
    .description("case view tokens trigger onRegister hook")
    .script({
      suppose: [
        fact("context is initialized", (context) => {
          context.setState({ logs: [] })
        }),
        fact("onRegister hook is used to add a container hook to each container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              const containerName = container.id !== undefined ?
                `${container}-${actions.get(container.id)}` :
                `${container}`
              context.state.logs.push(`Registering [${containerName}]`)
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  context.state.logs.push(`Writing [${containerName}] => ${JSON.stringify(message)}`)
                  actions.ok(message)
                },
              })
            },
          })
        }),
        fact("a conditional view is displayed", (context) => {
          const trigger = container<TriggerKind>({
            name: "trigger",
            initialValue: { type: "fruit", name: "apple" }
          })

          function fruitView(fruit: State<FruitKind>): HTMLView {
            return root => {
              const counter = container({ name: "fruit-counter", initialValue: 0 })

              root.div(el => {
                el.children
                  .h1(el => {
                    el.children.textNode(get => `${get(fruit).name} clicks: ${get(counter)}`)
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("fruit-counter")
                      .on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Click!")
                  })
              })
            }
          }

          function shapeView(shape: State<ShapeKind>): HTMLView {
            return root => {
              const counter = container({ name: "shape-counter", initialValue: 0 })

              root.div(el => {
                el.children
                  .h1(el => {
                    el.children.textNode(get => `Shape with ${get(shape).corners} corners clicks: ${get(counter)}`)
                  })
                  .button(el => {
                    el.config
                      .dataAttribute("shape-counter")
                      .on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Click!")
                  })
              })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(get => get(trigger))
                    .when(kind => kind.type === "fruit", fruitView)
                    .when(kind => kind.type === "shape", shapeView)
                })
                .hr()
                .button(el => {
                  el.config
                    .dataAttribute("fruit-trigger")
                    .on("click", () => write(trigger, { type: "fruit", name: "apple" }))
                  el.children.textNode("Fruit View")
                })
                .button(el => {
                  el.config
                    .dataAttribute("shape-trigger")
                    .on("click", () => write(trigger, { type: "shape", corners: 8 }))
                  el.children.textNode("Shape View")
                })
            })
          })
        })
      ],
      perform: [
        step("update the fruit counter", async () => {
          await selectElement("button[data-fruit-counter]").click()
          await selectElement("button[data-fruit-counter]").click()
        })
      ],
      observe: [
        effect("the fruit counter updates", async () => {
          await expect(selectElement("h1").text(), resolvesTo("apple clicks: 2"))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [trigger]",
            "Registering [fruit-counter]",
            "Writing [fruit-counter] => 1",
            "Writing [fruit-counter] => 2",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("trigger a different view to appear", async () => {
          await selectElement("button[data-shape-trigger]").click()
        }),
        step("update the counter", async () => {
          await selectElement("button[data-shape-counter]").click()
          await selectElement("button[data-shape-counter]").click()
          await selectElement("button[data-shape-counter]").click()
          await selectElement("button[data-shape-counter]").click()
        })
      ],
      observe: [
        effect("the shape counter is updated", async () => {
          await expect(selectElement("h1").text(), resolvesTo("Shape with 8 corners clicks: 4"))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [trigger]",
            "Registering [fruit-counter]",
            "Writing [fruit-counter] => 1",
            "Writing [fruit-counter] => 2",
            `Writing [trigger] => {"type":"shape","corners":8}`,
            "Registering [shape-counter]",
            "Writing [shape-counter] => 1",
            "Writing [shape-counter] => 2",
            "Writing [shape-counter] => 3",
            "Writing [shape-counter] => 4",
          ]))
        })
      ]
    })

])

interface HooksContext {
  logs: Array<string>
}

interface FruitKind {
  type: "fruit"
  name: string
}

interface ShapeKind {
  type: "shape"
  corners: number
}

type TriggerKind = FruitKind | ShapeKind