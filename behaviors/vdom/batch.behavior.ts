import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { batch, container, Container, derived, DerivedState, reset, StoreMessage, use, write } from "@store/index";
import { HTMLView, UseItem } from "@view/index";
import { selectElement } from "./helpers/displayElement";
import { equalTo, expect, is, resolvesTo } from "great-expectations";

interface BatchViewContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  calculated: DerivedState<string>
  calculations: Array<string>
}

interface BatchQueryViewContext extends BatchViewContext {
  queried: Container<string>
}

interface ShowPage {
  type: "show"
}

interface HidePage {
  type: "hide"
}

type PageState = ShowPage | HidePage

export default behavior("batched messages dispatched from a view", [

  example(renderContext<BatchViewContext>())
    .description("batch dispatched from a conditional view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setDerivedState(context)
        }),
        fact("a conditional view dispatches a batch that updates the containers", (context) => {
          const showButton = container({ initialValue: true })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .subviewMatching(selector => {
                  selector.withConditions()
                    .when(get => get(showButton), batchButtonView(updateMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the conditional view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "27 + cool = awesome!"
          ))
        }),
        effect("the calculated value is updated once for the batch", (context) => {
          expect(context.state.calculations, is(equalTo([
            "0 + hello = awesome!",
            "27 + cool = awesome!"
          ])))
        })
      ]
    }),

  example(renderContext<BatchViewContext>())
    .description("batch dispatched from a union case view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setDerivedState(context)
        }),
        fact("a union case view dispatches a batch that updates the containers", (context) => {
          const pageState = container<PageState>({ initialValue: { type: "show" } })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .subviewMatching(selector => {
                  selector.withUnion(get => get(pageState))
                    .when((page): page is ShowPage => page.type === "show", () => batchButtonView(updateMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the union case view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "27 + cool = awesome!"
          ))
        }),
        effect("the calculated value is updated once for the batch", (context) => {
          expect(context.state.calculations, is(equalTo([
            "0 + hello = awesome!",
            "27 + cool = awesome!"
          ])))
        })
      ]
    }),

  example(renderContext<BatchViewContext>())
    .description("batch with reset dispatched from a conditional view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setDerivedState(context)
        }),
        fact("the number container has a published value", (context) => {
          context.writeTo(context.state.numberContainer, 14)
        }),
        fact("a conditional view dispatches a batch that resets a container", (context) => {
          const showButton = container({ initialValue: true })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .subviewMatching(selector => {
                  selector.withConditions()
                    .when(get => get(showButton), batchButtonView(resetMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the conditional view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "0 + cool = awesome!"
          ))
        }),
        effect("the calculated value is updated once for the batch", (context) => {
          expect(context.state.calculations, is(equalTo([
            "14 + hello = awesome!",
            "0 + cool = awesome!"
          ])))
        })
      ]
    }),

  example(renderContext<BatchViewContext>())
    .description("batch with reset dispatched from a union case view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setDerivedState(context)
        }),
        fact("the number container has a published value", (context) => {
          context.writeTo(context.state.numberContainer, 14)
        }),
        fact("a union case view dispatches a batch that resets a container", (context) => {
          const pageState = container<PageState>({ initialValue: { type: "show" } })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .subviewMatching(selector => {
                  selector.withUnion(get => get(pageState))
                    .when((page): page is ShowPage => page.type === "show", () => batchButtonView(resetMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the union case view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "0 + cool = awesome!"
          ))
        }),
        effect("the calculated value is updated once for the batch", (context) => {
          expect(context.state.calculations, is(equalTo([
            "14 + hello = awesome!",
            "0 + cool = awesome!"
          ])))
        })
      ]
    }),

  example(renderContext<BatchQueryViewContext>())
    .description("batch with use that queries a derived value updated earlier in the batch dispatched from a conditional view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setQueryState(context)
        }),
        fact("a conditional view dispatches a batch that queries the derived value after updating a container", (context) => {
          const showButton = container({ initialValue: true })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .p(el => {
                  el.config.dataAttribute("queried")
                  el.children.textNode(get => get(context.state.queried))
                })
                .subviewMatching(selector => {
                  selector.withConditions()
                    .when(get => get(showButton), batchButtonView(queryMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the conditional view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "27 + hello = awesome!"
          ))
        }),
        effect("the query sees the derived value that accounts for the earlier message in the batch", async () => {
          await expect(selectElement("[data-queried]").text(), resolvesTo(
            "27 + hello = awesome!"
          ))
        })
      ]
    }),

  example(renderContext<BatchQueryViewContext>())
    .description("batch with use that queries a derived value updated earlier in the batch dispatched from a union case view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setQueryState(context)
        }),
        fact("a union case view dispatches a batch that queries the derived value after updating a container", (context) => {
          const pageState = container<PageState>({ initialValue: { type: "show" } })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .p(el => {
                  el.config.dataAttribute("queried")
                  el.children.textNode(get => get(context.state.queried))
                })
                .subviewMatching(selector => {
                  selector.withUnion(get => get(pageState))
                    .when((page): page is ShowPage => page.type === "show", () => batchButtonView(queryMessages(context.state)))
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the union case view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "27 + hello = awesome!"
          ))
        }),
        effect("the query sees the derived value that accounts for the earlier message in the batch", async () => {
          await expect(selectElement("[data-queried]").text(), resolvesTo(
            "27 + hello = awesome!"
          ))
        })
      ]
    }),

  example(renderContext<BatchQueryViewContext>())
    .description("batch with use that queries a derived value updated earlier in the batch dispatched from a list item view")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          setQueryState(context)
        }),
        fact("a list item view dispatches a batch that queries the item and the derived value after updating a container", (context) => {
          const items = container({ initialValue: ["fun-item"] })

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .p(el => {
                  el.config.dataAttribute("queried")
                  el.children.textNode(get => get(context.state.queried))
                })
                .subviews(get => get(items), useItem => batchButtonView(itemQueryMessages(context.state, useItem)))
            })
          })
        })
      ],
      perform: [
        step("the button in the list item view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view shows the updated calculated value", async () => {
          await expect(selectElement("[data-calculated]").text(), resolvesTo(
            "27 + hello = awesome!"
          ))
        }),
        effect("the query sees the item and the derived value that accounts for the earlier message in the batch", async () => {
          await expect(selectElement("[data-queried]").text(), resolvesTo(
            "fun-item: 27 + hello = awesome!"
          ))
        })
      ]
    })

])


function setDerivedState(context: { setState(state: BatchViewContext): void }) {
  const numberContainer = container({ initialValue: 0 })
  const stringContainer = container({ initialValue: "hello" })
  const calculations: Array<string> = []
  context.setState({
    numberContainer,
    stringContainer,
    calculations,
    calculated: derived(get => {
      const value = `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
      calculations.push(value)
      return value
    })
  })
}

function setQueryState(context: { setState(state: BatchQueryViewContext): void }) {
  setDerivedState({
    setState: (state) => context.setState({
      ...state,
      queried: container({ initialValue: "nothing yet" })
    })
  })
}

function queryMessages(state: BatchQueryViewContext): Array<StoreMessage> {
  return [
    write(state.numberContainer, 27),
    use(get => write(state.queried, get(state.calculated)))
  ]
}

function itemQueryMessages(state: BatchQueryViewContext, useItem: UseItem<string>): Array<StoreMessage> {
  return [
    write(state.numberContainer, 27),
    use(useItem((item, get) => write(state.queried, `${item.data}: ${get(state.calculated)}`)))
  ]
}

function updateMessages(state: BatchViewContext): Array<StoreMessage> {
  return [
    write(state.numberContainer, 27),
    write(state.stringContainer, "cool"),
  ]
}

function resetMessages(state: BatchViewContext): Array<StoreMessage> {
  return [
    reset(state.numberContainer),
    write(state.stringContainer, "cool"),
  ]
}

function batchButtonView(messages: Array<StoreMessage>): HTMLView {
  return root => {
    root.button(el => {
      el.config.on("click", () => batch(messages))
      el.children.textNode("Update")
    })
  }
}
