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
  supplied,
  SuppliedState,
  useCommand,
  write,
} from "@store/index.js"
import { HTMLBuilder } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElement } from "./helpers/displayElement"
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
])
