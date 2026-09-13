import { behavior, effect, example, fact, step } from "best-behavior";
import { defined, expect, is, resolvesTo } from "great-expectations";
import { Container, container, derived, update } from "@store/index.js";
import { renderContext } from "./helpers/renderContext.js";
import { HTMLBuilder, HTMLView } from "@view/htmlElements.js";
import { UseCase } from "@view/index.js";
import { selectElement } from "./helpers/displayElement.js";
import { requestGC } from "./helpers/memoryHelpers.js";

const extraState = container({ initialValue: "Hello!" })

export default behavior("conditional view memory", [

  example(renderContext<Container<number>>())
    .description("external state is referenced in conditional view")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 1 }))
        }),
        fact("there is a view selector", (context) => {
          function evenView(root: HTMLBuilder) {
            root.p(el => {
              el.config.dataAttribute("counter-text", get => `${get(context.state)}`)
              el.children.textNode(get => `${get(extraState)} The counter is even: ${get(context.state)}`)
            })
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subviewMatching(select => select.withConditions()
                  .when(get => get(context.state) % 2 === 0, evenView)
                  .default(root => {
                    root.p(el => {
                      el.children.textNode("Try clicking the button!")
                    })
                  })
                )
                .div(el => {
                  el.children.button(el => {
                    el.config.on("click", () => update(context.state, val => val + 1))
                    el.children.textNode("Click to increment!")
                  })
                })
            })
          })
        })
      ],
      perform: [
        step("the conditional view subscribes to the state", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-counter-text]").text(), resolvesTo("Hello! The counter is even: 4"))
        })
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the conditional view", () => {
          const el = document.querySelector("p[data-counter-text]")
          expect(el, is(defined()))
          window.__element_ref = new WeakRef(el!)
        }),
        step("hide the view", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the conditional view updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Try clicking the button!"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("external state is referenced in union case view")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 1 }))
        }),
        fact("there is a union view selector", (context) => {
          const parity = derived<Parity>(get => {
            const count = get(context.state)
            return count % 2 === 0 ? { type: "even", count } : { type: "odd" }
          })

          function evenView(useCase: UseCase<EvenCount>): HTMLView {
            // A token created within the case view that depends on external state
            const description = derived(get => `${get(extraState)} The counter is even:`)

            return root => {
              root.p(el => {
                el.config.dataAttribute("counter-text", useCase(even => `${even.count}`))
                el.children.textNode(useCase((even, get) => `${get(description)} ${even.count}`))
              })
            }
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .subviewMatching(select => select.withUnion(get => get(parity))
                  .when(val => val.type === "even", evenView)
                  .when(val => val.type === "odd", () => root => {
                    root.p(el => {
                      el.children.textNode(get => `${get(extraState)} Try clicking the button!`)
                    })
                  })
                )
                .div(el => {
                  el.children.button(el => {
                    el.config.on("click", () => update(context.state, val => val + 1))
                    el.children.textNode("Click to increment!")
                  })
                })
            })
          })
        })
      ],
      perform: [
        step("the case view subscribes to the state", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-counter-text]").text(), resolvesTo("Hello! The counter is even: 4"))
        })
      ]
    })
    .andThen({
      perform: [
        step("create a reference for the case view", () => {
          const el = document.querySelector("p[data-counter-text]")
          expect(el, is(defined()))
          window.__element_ref = new WeakRef(el!)
        }),
        step("switch to the other case", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the case view updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Hello! Try clicking the button!"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        })
      ]
    })
])

interface EvenCount {
  type: "even"
  count: number
}

interface OddCount {
  type: "odd"
}

type Parity = EvenCount | OddCount