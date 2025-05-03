import { behavior, effect, example, fact, step } from "best-behavior";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { container, Container, derived, State, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

export default behavior("view of discriminated union state", [

  discriminatedUnionSwitchViewExample("client rendered", (context, view) => context.mountView(view)),
  discriminatedUnionSwitchViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

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
    }),

  example(renderContext<Container<PageState>>())
    .description("select view of select views")
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listView)
                    .when(page => page.type === "detail", detailViewWithContent)
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
        step("click on an item", async () => {
          await selectElements("li").at(1).click()
        })
      ],
      observe: [
        effect("the item content is displayed", async () => {
          await expect(selectElement("p").text(), resolvesTo("You find this clothing fun: hat"))
        })
      ]
    }).andThen({
      perform: [
        step("return to the list view", context => {
          context.writeTo(pageState, { type: "list", data: { items: ["a", "b", "c"] } })
        })
      ],
      observe: [
        effect("the list view is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "a", "b", "c"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click on an another item", async () => {
          await selectElements("li").at(2).click()
        })
      ],
      observe: [
        effect("the item content is displayed", async () => {
          await expect(selectElement("p").text(), resolvesTo("You find this music awesome: Bach"))
        })
      ]
    })

])

function discriminatedUnionSwitchViewExample(name: string, renderer: (context: RenderApp<Container<PageState>>, view: HTMLView) => void) {
  return example(renderContext<Container<PageState>>())
    .description(`view based on selector with exhaustive cases (${name})`)
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          renderer(context, root => {
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
          await expect(selectElement("[data-detail-name]").text(), resolvesTo("grapes has 6 characters"))
        })
      ]
    }).andThen({
      perform: [
        step("return to the first view", (context) => {
          context.writeTo(pageState, { type: "list", data: { items: ["hat", "coat", "pants"] } })
        })
      ],
      observe: [
        effect("the view updates accordingly", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "hat", "coat", "pants"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the data for the current view", (context) => {
          context.writeTo(pageState, { type: "list", data: { items: ["red", "orange", "blue", "green"] } })
        })
      ],
      observe: [
        effect("the view updates accordingly", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "red", "orange", "blue", "green"
          ]))
        })
      ]
    })
}

const pageState = container<PageState>({
  initialValue: {
    type: "list",
    data: {
      items: ["apple", "pear", "grapes", "banana"]
    }
  }
})

function listView(state: State<ListState>): HTMLView {
  const items = derived(get => get(state).data.items)
  return root => {
    root.ul(el => {
      el.children.subviews(get => get(items), (item, index) => root => {
        root.li(el => {
          el.config.on("click", () => {
            return use(get => write(pageState, {
              type: "detail", detail: {
                name: get(item),
                content: getContent(get(index))
              }
            }))
          })
          el.children.textNode(get => get(item))
        })
      })
    })
  }
}

function getContent(id: number): DetailContent {
  if (id % 2 === 0) {
    return { type: "awesome-content", music: "Bach" }
  } else {
    return { type: "fun-content", clothing: "hat" }
  }
}

function detailView(state: State<DetailState>): HTMLView {
  const name = derived(get => get(state).detail.name)
  return root => {
    root.h3(el => {
      el.config.dataAttribute("detail-name")
      el.children.textNode(get => `${get(name)} has ${get(name).length} characters`)
    })
  }
}

function detailViewWithContent(state: State<DetailState>): HTMLView {
  const detail = derived(get => get(state).detail)
  const name = derived(get => get(detail).name)

  return root => {
    root.div(el => {
      el.children
        .h3(el => {
          el.config.dataAttribute("detail-name")
          el.children.textNode(get => `${get(name)} has ${get(name).length} characters`)
        })
        .subview(presentContent(detail))
    })
  }
}

function presentContent(state: State<Detail>): HTMLView {
  const content = derived(get => get(state).content)

  return root => {
    root.p(el => {
      el.children.subviewFrom(selector => {
        selector.withUnion(content)
          .when(content => content.type === "fun-content", funContentView)
          .when(content => content.type === "awesome-content", awesomeContentView)
      })
    })
  }
}

function funContentView(state: State<FunContent>): HTMLView {
  return root => {
    root.textNode(get => `You find this clothing fun: ${get(state).clothing}`)
  }
}

function awesomeContentView(state: State<AwesomeContent>): HTMLView {
  return root => {
    root.textNode(get => `You find this music awesome: ${get(state).music}`)
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
  data: { items: Array<string> }
}

interface FunContent {
  type: "fun-content"
  clothing: string
}

interface AwesomeContent {
  type: "awesome-content"
  music: string
}

type DetailContent = FunContent | AwesomeContent

interface Detail {
  name: string
  content: DetailContent
}

interface DetailState {
  type: "detail"
  detail: Detail
}

type PageState = ListState | DetailState