import {
  Command,
  command,
  CommandActions,
  Container,
  container,
  exec,
  meta,
  pending,
  supplied,
  SuppliedState,
  useCommand,
  write,
} from "@store/index.js"
import { HTMLView, UseItem } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElements } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface LoadRequest {
  data: Container<string | undefined>
}

interface ListContainerContext {
  items: Container<Array<string>>
  load: Command<LoadRequest>
  pendingLoad?: { request: LoadRequest; actions: CommandActions }
}

interface SuppliedLoadRequest {
  data: SuppliedState<string | undefined>
}

interface ListSuppliedStateContext {
  items: Container<Array<string>>
  load: Command<SuppliedLoadRequest>
  pendingLoad?: { request: SuppliedLoadRequest; actions: CommandActions }
}

export default behavior("state declared in a list item view", [
  example(renderContext<ListContainerContext>())
    .description("meta state of a container declared in a list item view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] }),
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
        fact("there is a list view where each item declares a container", (context) => {
          function itemView(useItem: UseItem<string>): HTMLView {
            const data = container<string | undefined>({ initialValue: undefined })

            return (root) => {
              root.div((el) => {
                el.children
                  .button((el) => {
                    el.config.on("click", () => exec(context.state.load, { data }))
                    el.children.textNode("Load")
                  })
                  .p((el) => {
                    el.children.textNode(
                      useItem(
                        (item, get) =>
                          `${item.data} - ${get(meta(data)).type}: ${get(data) ?? "nothing"}`,
                      ),
                    )
                  })
              })
            }
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviews((get) => get(context.state.items), itemView)
            })
          })
        }),
      ],
      perform: [
        step("load the data for the second item", async () => {
          await selectElements("button").at(1).click()
        }),
      ],
      observe: [
        effect("only the second item's meta state is pending", async () => {
          await expect(
            selectElements("p").texts(),
            resolvesTo(["one - ok: nothing", "two - pending: nothing", "three - ok: nothing"]),
          )
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
        effect("the second item's meta state is ok and the value is shown", async () => {
          await expect(
            selectElements("p").texts(),
            resolvesTo(["one - ok: nothing", "two - ok: loaded", "three - ok: nothing"]),
          )
        }),
      ],
    }),

  example(renderContext<ListSuppliedStateContext>())
    .description("meta state of supplied state declared in a list item view")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two", "three"] }),
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
        fact("there is a list view where each item declares supplied state", (context) => {
          function itemView(useItem: UseItem<string>): HTMLView {
            const data = supplied<string | undefined>({ initialValue: undefined })

            return (root) => {
              root.div((el) => {
                el.children
                  .button((el) => {
                    el.config.on("click", () => exec(context.state.load, { data }))
                    el.children.textNode("Load")
                  })
                  .p((el) => {
                    el.children.textNode(
                      useItem(
                        (item, get) =>
                          `${item.data} - ${get(meta(data)).type}: ${get(data) ?? "nothing"}`,
                      ),
                    )
                  })
              })
            }
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviews((get) => get(context.state.items), itemView)
            })
          })
        }),
      ],
      perform: [
        step("load the data for the second item", async () => {
          await selectElements("button").at(1).click()
        }),
      ],
      observe: [
        effect("only the second item's meta state is pending", async () => {
          await expect(
            selectElements("p").texts(),
            resolvesTo(["one - ok: nothing", "two - pending: nothing", "three - ok: nothing"]),
          )
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
        effect("the second item's meta state is ok and the value is shown", async () => {
          await expect(
            selectElements("p").texts(),
            resolvesTo(["one - ok: nothing", "two - ok: loaded", "three - ok: nothing"]),
          )
        }),
      ],
    }),
])
