import {
  Command,
  command,
  CommandActions,
  Container,
  container,
  derived,
  exec,
  meta,
  pending,
  State,
  supplied,
  SuppliedState,
  useCommand,
  write,
} from "@store/index.js"
import { HTMLBuilder, UseCase } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElement, selectElements } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface ConditionalStateContext {
  show: Container<boolean>
  focused: Container<boolean>
}

interface LoadRequest {
  data: SuppliedState<string | undefined>
}

interface ConditionalSuppliedStateContext {
  show: Container<boolean>
  load: Command<LoadRequest>
  pendingLoad?: { request: LoadRequest; actions: CommandActions }
}

interface ContainerLoadRequest {
  data: Container<string | undefined>
}

interface ConditionalContainerContext {
  show: Container<boolean>
  load: Command<ContainerLoadRequest>
  pendingLoad?: { request: ContainerLoadRequest; actions: CommandActions }
}

interface ListView {
  type: "list"
  items: State<Array<string>>
}

interface SwitchedDependencyContext {
  items: Container<Array<string>>
  listA: State<Array<string>>
  listB: State<Array<string>>
  view: Container<ListView>
}

export default behavior("state declared in a conditional view", [
  example(renderContext<ConditionalStateContext>())
    .description("derived state declared in a view that is removed and shown again")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            focused: container({ initialValue: false }),
          })
        }),
        fact("there is a conditional view that declares derived state", (context) => {
          function panel(root: HTMLBuilder) {
            const isFocused = derived((get) => get(context.state.focused))

            root.p((el) => {
              el.children.textNode((get) => `Focused: ${get(isFocused)}`)
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector.withConditions().when((get) => get(context.state.show), panel),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the derived state is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("reset the state", (context) => {
          context.writeTo(context.state.focused, false)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the derived state is shown with the latest value", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state again", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    }),

  example(renderContext<ConditionalStateContext>())
    .description("derived state declared in a union view that is removed and shown again")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            focused: container({ initialValue: false }),
          })
        }),
        fact("there is a union view that declares derived state", (context) => {
          function panel(root: HTMLBuilder) {
            const isFocused = derived((get) => get(context.state.focused))

            root.p((el) => {
              el.children.textNode((get) => `Focused: ${get(isFocused)}`)
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector
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
        effect("the derived state is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("reset the state", (context) => {
          context.writeTo(context.state.focused, false)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the derived state is shown with the latest value", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state again", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    }),

  example(renderContext<ConditionalSuppliedStateContext>())
    .description("meta state of supplied state declared in a conditional view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            load: command(),
          })
        }),
        fact("there is a command that marks the supplied state pending", (context) => {
          useCommand(context.store, context.state.load, {
            exec(request, actions) {
              actions.supply(meta(request.data), pending())
              context.state.pendingLoad = { request, actions }
            },
          })
        }),
        fact("there is a conditional view that declares supplied state", (context) => {
          function panel(root: HTMLBuilder) {
            const data = supplied<string | undefined>({ initialValue: undefined })

            root.div((el) => {
              el.children
                .button((el) => {
                  el.config.on("click", () => exec(context.state.load, { data }))
                  el.children.textNode("Load")
                })
                .p((el) => {
                  el.children.textNode(
                    (get) => `${get(meta(data)).type}: ${get(data) ?? "nothing"}`,
                  )
                })
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector.withConditions().when((get) => get(context.state.show), panel),
              )
            })
          })
        }),
      ],
      perform: [
        step("load the data", async () => {
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the meta state is pending", async () => {
          await expect(selectElement("p").text(), resolvesTo("pending: nothing"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the data is supplied", (context) => {
          const { request, actions } = context.state.pendingLoad!
          actions.supply(request.data, "loaded")
        }),
      ],
      observe: [
        effect("the meta state is ok and the value is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("ok: loaded"))
        }),
      ],
    }),

  example(renderContext<ConditionalContainerContext>())
    .description("meta state of a container declared in a conditional view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            load: command(),
          })
        }),
        fact("there is a command that marks the container pending", (context) => {
          useCommand(context.store, context.state.load, {
            exec(request, actions) {
              actions.supply(meta(request.data), pending())
              context.state.pendingLoad = { request, actions }
            },
          })
        }),
        fact("there is a conditional view that declares a container", (context) => {
          function panel(root: HTMLBuilder) {
            const data = container<string | undefined>({ initialValue: undefined })

            root.div((el) => {
              el.children
                .button((el) => {
                  el.config.on("click", () => exec(context.state.load, { data }))
                  el.children.textNode("Load")
                })
                .p((el) => {
                  el.children.textNode(
                    (get) => `${get(meta(data)).type}: ${get(data) ?? "nothing"}`,
                  )
                })
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector.withConditions().when((get) => get(context.state.show), panel),
              )
            })
          })
        }),
      ],
      perform: [
        step("load the data", async () => {
          await selectElement("button").click()
        }),
      ],
      observe: [
        effect("the meta state is pending", async () => {
          await expect(selectElement("p").text(), resolvesTo("pending: nothing"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the container is written", (context) => {
          const { request, actions } = context.state.pendingLoad!
          actions.dispatch(write(request.data, "loaded"))
        }),
      ],
      observe: [
        effect("the meta state is ok and the value is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("ok: loaded"))
        }),
      ],
    }),

  example(renderContext<SwitchedDependencyContext>())
    .description(
      "derived state in a union view that switches away from its initial dependency and back",
    )
    .script({
      suppose: [
        fact("there is state with two lists derived from it", (context) => {
          const items = container({ initialValue: ["a-1", "a-2", "b-1"] })
          const listA = derived((get) => get(items).filter((item) => item.startsWith("a")))
          const listB = derived((get) => get(items).filter((item) => item.startsWith("b")))
          context.setState({
            items,
            listA,
            listB,
            view: container<ListView>({ initialValue: { type: "list", items: listB } }),
          })
        }),
        fact(
          "there is a union view that declares derived state based on the selected list",
          (context) => {
            function listView(useCase: UseCase<ListView>) {
              const listItems = derived(useCase((view, get) => get(view.items)))

              return (root: HTMLBuilder) => {
                root.ul((el) => {
                  el.children.subviews(
                    (get) => get(listItems),
                    (useItem) => (root) => {
                      root.li((el) => {
                        el.children.textNode(useItem((item) => item.data))
                      })
                    },
                  )
                })
              }
            }

            context.mountView((root) => {
              root.main((el) => {
                el.children.subviewMatching((selector) =>
                  selector
                    .withUnion((get) => get(context.state.view))
                    .when((view): view is ListView => view.type === "list", listView),
                )
              })
            })
          },
        ),
      ],
      perform: [
        step("show list A, then list B, then list A again", (context) => {
          context.writeTo(context.state.view, { type: "list", items: context.state.listA })
          context.writeTo(context.state.view, { type: "list", items: context.state.listB })
          context.writeTo(context.state.view, { type: "list", items: context.state.listA })
        }),
      ],
      observe: [
        effect("list A is shown", async () => {
          await expect(selectElements("li").texts(), resolvesTo(["a-1", "a-2"]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("remove an item from list A", (context) => {
          context.writeTo(context.state.items, ["a-1", "b-1"])
        }),
      ],
      observe: [
        effect("the removed item is no longer shown", async () => {
          await expect(selectElements("li").texts(), resolvesTo(["a-1"]))
        }),
      ],
    }),
])
