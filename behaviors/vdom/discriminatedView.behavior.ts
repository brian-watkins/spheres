import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { container, Container, State, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

export default behavior("view of discriminated union state", [

  example(renderContext<Container<PageState>>())
    .description("discriminated views")
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listView)
                    .when(page => page.type === "detail", detailView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the view for initial state is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "apple", "pear", "grapes", "banana"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the page state with another discriminant", async () => {
          await selectElements("li").at(2).click()
        })
      ],
      observe: [
        effect("the view for the discriminant is displayed", async () => {
          await expect(selectElement("[data-detail-name]").text(), resolvesTo("grapes"))
        })
      ]
    }),

  example(renderContext<Container<PageState>>())
    .description("selecting from union with default case")
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listView)
                    .default(defaultView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the view for initial state is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "apple", "pear", "grapes", "banana"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the page state with another discriminant", async () => {
          await selectElements("li").at(2).click()
        })
      ],
      observe: [
        effect("the default view is displayed", async () => {
          await expect(selectElement("[data-default]").text(), resolvesTo("No view for detail"))
        })
      ]
    })

])

const pageState = container<PageState>({
  initialValue: {
    type: "list",
    items: ["apple", "pear", "grapes", "banana"]
  }
})

function listView(state: State<ListState>): HTMLView {
  return root => {
    root.ul(el => {
      el.children.subviews(get => get(state).items, item => root => {
        root.li(el => {
          el.config.on("click", () => {
            return use(get => write(pageState, { type: "detail", name: get(item) }))
          })
          el.children.textNode(get => get(item))
        })
      })
    })
  }
}

function detailView(state: State<DetailState>): HTMLView {
  return root => {
    root.h3(el => {
      el.config.dataAttribute("detail-name")
      el.children.textNode(get => get(state).name)
    })
  }
}

function defaultView(state: State<PageState>): HTMLView {
  return root => {
    root.div(el => {
      el.config.dataAttribute("default")
      el.children
        .textNode(get => `No view for ${get(state).type}`)
    })
  }
}

interface ListState {
  type: "list"
  items: Array<string>
}

interface DetailState {
  type: "detail"
  name: string
}

type PageState = ListState | DetailState