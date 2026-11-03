import {
  collection,
  Collection,
  container,
  Container,
  derived,
  DerivedState,
  use,
  write,
} from "@store/index.js"
import { HTMLView, UseItem } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElements } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface RootDerivedContext {
  items: Container<Array<string>>
  sharedCount: DerivedState<Container<number>>
}

interface Cell {
  count: Container<number>
}

interface RootCollectionContext {
  items: Container<Array<string>>
  cells: Collection<string, Container<Cell>>
}

export default behavior("token origin", [
  example(renderContext<RootDerivedContext>())
    .description("root derived state that creates a token is first read by a list item view")
    .script({
      suppose: [
        fact("there is root derived state that creates a container", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two"] }),
            sharedCount: derived(() => container({ initialValue: 0 })),
          })
        }),
        fact("list items read the created container through derived state", (context) => {
          function itemView(useItem: UseItem<string>): HTMLView {
            const label = derived((get) => get(get(context.state.sharedCount)))

            return (root) => {
              root.p((el) => {
                el.children.textNode(useItem((item, get) => `${item.data}: ${get(label)}`))
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
        step("the created container is written from the root store", (context) => {
          context.store.dispatch(use((get) => write(get(context.state.sharedCount), 5)))
        }),
      ],
      observe: [
        effect("every list item shows the written value", async () => {
          await expect(selectElements("p").texts(), resolvesTo(["one: 5", "two: 5"]))
        }),
      ],
    }),

  example(renderContext<RootCollectionContext>())
    .description("root collection token with a nested token is first requested by a list item view")
    .script({
      suppose: [
        fact("there is a root collection whose tokens hold a nested container", (context) => {
          context.setState({
            items: container({ initialValue: ["one", "two"] }),
            cells: collection(() =>
              container({ initialValue: { count: container({ initialValue: 0 }) } }),
            ),
          })
        }),
        fact("list items request their cell through derived state", (context) => {
          function itemView(useItem: UseItem<string>): HTMLView {
            const label = derived({
              query: useItem((item, get) => get(get(context.state.cells.at(item.data)).count)),
            })

            return (root) => {
              root.p((el) => {
                el.children.textNode(useItem((item, get) => `${item.data}: ${get(label)}`))
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
        step("the nested container is written from the root store", (context) => {
          context.store.dispatch(use((get) => write(get(context.state.cells.at("two")).count, 5)))
        }),
      ],
      observe: [
        effect("the list item shows the written value", async () => {
          await expect(selectElements("p").texts(), resolvesTo(["one: 0", "two: 5"]))
        }),
      ],
    }),
])
