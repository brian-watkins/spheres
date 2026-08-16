import { behavior, effect, example, fact, step } from "best-behavior";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { ListExamplesState, containerWithList } from "./helpers/listHelpers";
import { container, update } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";
import { UseCase, UseItem } from "@view/index";

export default behavior("matched view within a list item", [

  matchedViewWithLocalStateExample("client rendered", (context, view) => context.mountView(view)),
  matchedViewWithLocalStateExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  conditionMatchedViewWithLocalStateExample("client rendered", (context, view) => context.mountView(view)),
  conditionMatchedViewWithLocalStateExample("server rendered", (context, view) => context.ssrAndActivate(view)),

])

function matchedViewWithLocalStateExample(name: string, renderer: (context: RenderApp<ListExamplesState>, view: HTMLView) => void) {
  return example(renderContext<ListExamplesState>())
    .description(`matched view and default view use local container state (${name})`)
    .script({
      suppose: [
        containerWithList(["a", "b", "c"]),
        fact("there is a list view whose items use a matched view with local container state", (context) => {
          function toggleView(useValue: UseCase<string>): HTMLView {
            return (root) => {
              const isOpen = container({ initialValue: false })

              root.div(el => {
                el.config.dataAttribute("toggle-item")
                el.children
                  .button(el => {
                    el.config.on("click", () => update(isOpen, (open) => !open))
                    el.children.textNode("Toggle")
                  })
                  .div(el => {
                    el.config.dataAttribute("item-state")
                    el.children.textNode(useValue((value, get) => `${value} is ${get(isOpen) ? "open" : "closed"}`))
                  })
              })
            }
          }

          function itemView(useItem: UseItem<string>): HTMLView {
            return (root) => {
              root.subviewMatching(selector => {
                selector.withUnion(useItem(item => item.data))
                  .when((data): data is string => data === "b", toggleView)
                  .default(toggleView)
              })
            }
          }

          renderer(context, (root) => {
            root.main(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      observe: [
        effect("each item is closed initially", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is closed",
            "b is closed",
            "c is closed",
          ]))
        })
      ]
    })
    .andThen({
      perform: [
        step("toggle the second item, which uses the matched view", async () => {
          await selectElements("[data-toggle-item] button").at(1).click()
        })
      ],
      observe: [
        effect("only the second item is open", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is closed",
            "b is open",
            "c is closed",
          ]))
        })
      ]
    })
    .andThen({
      perform: [
        step("toggle the first item, which uses the default view", async () => {
          await selectElements("[data-toggle-item] button").at(0).click()
        })
      ],
      observe: [
        effect("only the first and second items are open", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is open",
            "b is open",
            "c is closed",
          ]))
        })
      ]
    })
}

function conditionMatchedViewWithLocalStateExample(name: string, renderer: (context: RenderApp<ListExamplesState>, view: HTMLView) => void) {
  return example(renderContext<ListExamplesState>())
    .description(`condition matched view and default view use local container state (${name})`)
    .script({
      suppose: [
        containerWithList(["a", "b", "c"]),
        fact("there is a list view whose items use a condition matched view with local container state", (context) => {
          function toggleView(useItem: UseItem<string>): HTMLView {
            return (root) => {
              const isOpen = container({ initialValue: false })

              root.div(el => {
                el.config.dataAttribute("toggle-item")
                el.children
                  .button(el => {
                    el.config.on("click", () => update(isOpen, (open) => !open))
                    el.children.textNode("Toggle")
                  })
                  .div(el => {
                    el.config.dataAttribute("item-state")
                    el.children.textNode(useItem((item, get) => `${item.data} is ${get(isOpen) ? "open" : "closed"}`))
                  })
              })
            }
          }

          function itemView(useItem: UseItem<string>): HTMLView {
            return (root) => {
              root.subviewMatching(selector => {
                selector.withConditions()
                  .when(useItem(item => item.data === "b"), toggleView(useItem))
                  .default(toggleView(useItem))
              })
            }
          }

          renderer(context, (root) => {
            root.main(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      observe: [
        effect("each item is closed initially", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is closed",
            "b is closed",
            "c is closed",
          ]))
        })
      ]
    })
    .andThen({
      perform: [
        step("toggle the second item, which uses the condition matched view", async () => {
          await selectElements("[data-toggle-item] button").at(1).click()
        })
      ],
      observe: [
        effect("only the second item is open", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is closed",
            "b is open",
            "c is closed",
          ]))
        })
      ]
    })
    .andThen({
      perform: [
        step("toggle the first item, which uses the default view", async () => {
          await selectElements("[data-toggle-item] button").at(0).click()
        })
      ],
      observe: [
        effect("only the first and second items are open", async () => {
          await expect(selectElements("[data-item-state]").texts(), resolvesTo([
            "a is open",
            "b is open",
            "c is closed",
          ]))
        })
      ]
    })
}
