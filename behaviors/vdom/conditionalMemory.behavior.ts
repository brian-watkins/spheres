import { behavior, effect, example, fact, step } from "best-behavior"
import { defined, expect, is, resolvesTo } from "great-expectations"
import { Container, container, derived, update } from "@store/index.js"
import { renderContext } from "./helpers/renderContext.js"
import { HTMLBuilder, HTMLView } from "@view/htmlElements.js"
import { UseCase } from "@view/index.js"
import { selectElement } from "./helpers/displayElement.js"
import { requestGC } from "./helpers/memoryHelpers.js"

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
            root.p((el) => {
              el.config.dataAttribute("counter-text", (get) => `${get(context.state)}`)
              el.children.textNode(
                (get) => `${get(extraState)} The counter is even: ${get(context.state)}`,
              )
            })
          }

          context.mountView((root) => {
            root.div((el) => {
              el.children
                .subviewMatching((select) =>
                  select
                    .withConditions()
                    .when((get) => get(context.state) % 2 === 0, evenView)
                    .default((root) => {
                      root.p((el) => {
                        el.children.textNode("Try clicking the button!")
                      })
                    }),
                )
                .div((el) => {
                  el.children.button((el) => {
                    el.config.on("click", () => update(context.state, (val) => val + 1))
                    el.children.textNode("Click to increment!")
                  })
                })
            })
          })
        }),
      ],
      perform: [
        step("the conditional view subscribes to the state", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(
            selectElement("p[data-counter-text]").text(),
            resolvesTo("Hello! The counter is even: 4"),
          )
        }),
      ],
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
        }),
      ],
      observe: [
        effect("the conditional view updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Try clicking the button!"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        }),
      ],
    }),

  example(renderContext<Container<number>>())
    .description("external state is referenced in union case view")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 1 }))
        }),
        fact("there is a union view selector", (context) => {
          const parity = derived<Parity>((get) => {
            const count = get(context.state)
            return count % 2 === 0 ? { type: "even", count } : { type: "odd" }
          })

          function evenView(useCase: UseCase<EvenCount>): HTMLView {
            // A token created within the case view that depends on external state
            const description = derived((get) => `${get(extraState)} The counter is even:`)

            return (root) => {
              root.p((el) => {
                el.config.dataAttribute(
                  "counter-text",
                  useCase((even) => `${even.count}`),
                )
                el.children.textNode(useCase((even, get) => `${get(description)} ${even.count}`))
              })
            }
          }

          context.mountView((root) => {
            root.div((el) => {
              el.children
                .subviewMatching((select) =>
                  select
                    .withUnion((get) => get(parity))
                    .when((val) => val.type === "even", evenView)
                    .when(
                      (val) => val.type === "odd",
                      () => (root) => {
                        root.p((el) => {
                          el.children.textNode(
                            (get) => `${get(extraState)} Try clicking the button!`,
                          )
                        })
                      },
                    ),
                )
                .div((el) => {
                  el.children.button((el) => {
                    el.config.on("click", () => update(context.state, (val) => val + 1))
                    el.children.textNode("Click to increment!")
                  })
                })
            })
          })
        }),
      ],
      perform: [
        step("the case view subscribes to the state", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(
            selectElement("p[data-counter-text]").text(),
            resolvesTo("Hello! The counter is even: 4"),
          )
        }),
      ],
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
        }),
      ],
      observe: [
        effect("the case view updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Hello! Try clicking the button!"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        }),
      ],
    }),

  example(renderContext<Container<boolean>>())
    .description("local state is declared in a conditional view that is removed and shown again")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: true }))
        }),
        fact("there is a conditional view that declares local state", (context) => {
          function panel(root: HTMLBuilder) {
            const count = container({ initialValue: 0 })
            root.p((el) => {
              el.config.dataAttribute("doubled")
              el.children.textNode((get) => `Doubled: ${get(count) * 2}`)
            })
          }

          context.mountView((root) => {
            root.div((el) => {
              el.children.subviewMatching((select) =>
                select.withConditions().when((get) => get(context.state), panel),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("create a reference for the view", () => {
          const el = document.querySelector("p[data-doubled]")
          expect(el, is(defined()))
          window.__element_ref = new WeakRef(el!)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state, true)
        }),
      ],
      observe: [
        effect("the view is visible again", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        }),
      ],
    }),

  example(renderContext<Container<boolean>>())
    .description("local state is declared in a union case view that is removed and shown again")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: true }))
        }),
        fact("there is a union case view that declares local state", (context) => {
          function panel(root: HTMLBuilder) {
            const count = container({ initialValue: 0 })
            root.p((el) => {
              el.config.dataAttribute("doubled")
              el.children.textNode((get) => `Doubled: ${get(count) * 2}`)
            })
          }

          context.mountView((root) => {
            root.div((el) => {
              el.children.subviewMatching((select) =>
                select
                  .withUnion((get) => get(context.state))
                  .when(
                    (val): val is true => val === true,
                    () => panel,
                  ),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("create a reference for the view", () => {
          const el = document.querySelector("p[data-doubled]")
          expect(el, is(defined()))
          window.__element_ref = new WeakRef(el!)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state, true)
        }),
      ],
      observe: [
        effect("the view is visible again", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
        effect("the removed dom element is garbage collected", async () => {
          await requestGC()
          expect(window.__element_ref.deref(), is(undefined))
        }),
      ],
    }),

  example(renderContext<DerivedValueContext>())
    .description(
      "derived state of local state is declared in a conditional view that is removed and shown again",
    )
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            latestValueRef: undefined,
            removedValueRef: undefined,
          })
        }),
        fact(
          "there is a conditional view that declares derived state of local state",
          (context) => {
            function panel(root: HTMLBuilder) {
              const count = container({ initialValue: 0 })
              const doubled = derived((get) => {
                const result = { value: get(count) * 2 }
                context.state.latestValueRef = new WeakRef(result)
                return result
              })

              root.p((el) => {
                el.config.dataAttribute("doubled")
                el.children.textNode((get) => `Doubled: ${get(doubled).value}`)
              })
            }

            context.mountView((root) => {
              root.div((el) => {
                el.children.subviewMatching((select) =>
                  select.withConditions().when((get) => get(context.state.show), panel),
                )
              })
            })
          },
        ),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("create a reference for the derived value", (context) => {
          expect(context.state.latestValueRef, is(defined()))
          context.state.removedValueRef = context.state.latestValueRef
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the view is visible again", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
        effect("the derived value of the removed view is garbage collected", async (context) => {
          await requestGC()
          expect(context.state.removedValueRef!.deref(), is(undefined))
        }),
      ],
    }),

  example(renderContext<DerivedValueContext>())
    .description(
      "derived state of local state is declared in a union case view that is removed and shown again",
    )
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            latestValueRef: undefined,
            removedValueRef: undefined,
          })
        }),
        fact("there is a union case view that declares derived state of local state", (context) => {
          function panel(root: HTMLBuilder) {
            const count = container({ initialValue: 0 })
            const doubled = derived((get) => {
              const result = { value: get(count) * 2 }
              context.state.latestValueRef = new WeakRef(result)
              return result
            })

            root.p((el) => {
              el.config.dataAttribute("doubled")
              el.children.textNode((get) => `Doubled: ${get(doubled).value}`)
            })
          }

          context.mountView((root) => {
            root.div((el) => {
              el.children.subviewMatching((select) =>
                select
                  .withUnion((get) => get(context.state.show))
                  .when(
                    (val): val is true => val === true,
                    () => panel,
                  ),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("create a reference for the derived value", (context) => {
          expect(context.state.latestValueRef, is(defined()))
          context.state.removedValueRef = context.state.latestValueRef
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the view is visible again", async () => {
          await expect(selectElement("p[data-doubled]").text(), resolvesTo("Doubled: 0"))
        }),
        effect("the derived value of the removed view is garbage collected", async (context) => {
          await requestGC()
          expect(context.state.removedValueRef!.deref(), is(undefined))
        }),
      ],
    }),
])

interface EvenCount {
  type: "even"
  count: number
}

interface OddCount {
  type: "odd"
}

type Parity = EvenCount | OddCount

interface DerivedValueContext {
  show: Container<boolean>
  latestValueRef: WeakRef<{ value: number }> | undefined
  removedValueRef: WeakRef<{ value: number }> | undefined
}
