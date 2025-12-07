import { behavior, effect, example, fact, step } from "best-behavior";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { batch, container, Container, derived, State, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

export default behavior("view of discriminated union state", [

  discriminatedUnionSwitchViewExample("client rendered", (context, view) => context.mountView(view)),
  discriminatedUnionSwitchViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  discriminatedUnionReuseViewExample("client rendered", (context, view) => context.mountView(view)),
  discriminatedUnionReuseViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

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
          context.writeTo(pageState, { type: "list", data: { items: ["a", "b", "c"] }, selected: "a" })
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
        }),
        effect("the selected item is selected", async () => {
          await expect(selectElements("li").at(1).property("className"), resolvesTo("selected-item"))
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
          context.writeTo(pageState, { type: "list", data: { items: ["hat", "coat", "pants"] }, selected: "pants" })
        })
      ],
      observe: [
        effect("the view updates accordingly", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "hat", "coat", "pants"
          ]))
        }),
        effect("the selected item is selected", async () => {
          await expect(selectElements("li").at(2).property("className"), resolvesTo("selected-item"))
        })
      ]
    }).andThen({
      perform: [
        step("update the data for the current view", (context) => {
          context.writeTo(pageState, { type: "list", data: { items: ["red", "orange", "blue", "green"] }, selected: "green" })
        })
      ],
      observe: [
        effect("the view updates accordingly", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "red", "orange", "blue", "green"
          ]))
        }),
        effect("the selected item is selected", async () => {
          await expect(selectElements("li").at(3).property("className"), resolvesTo("selected-item"))
        })
      ]
    })
}

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.selected-item { color: #f00; }';
document.getElementsByTagName('head')[0].appendChild(style);

function discriminatedUnionReuseViewExample(name: string, renderer: (context: RenderApp<Container<PageState>>, view: HTMLView) => void) {
  return example(renderContext<Container<PageState>>())
    .description(`view based on selector with a single case (${name})`)
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          renderer(context, root => {
            root.main(el => {
              el.children
                .button(el => {
                  el.config.on("click", () => {
                    return use(get => {
                      const state = get(pageState)
                      if (state.type === "list") {
                        const i = state.data.items.findIndex((item) => item === state.selected)
                        const next = state.data.items[(i + 1) % state.data.items.length]
                        return write(pageState, { ...state, selected: next })
                      } else {
                        return batch([])
                      }
                    })
                  })
                  el.children.textNode("Select Next")
                })
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", staticList)
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
        }),
        effect("the selected item has the selected class", async () => {
          await expect(
            selectElements("li").at(1).property("className"),
            resolvesTo("selected-item")
          )
        })
      ]
    }).andThen({
      perform: [
        step("update the list state with a new selected item", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the selected item has the selected class", async () => {
          await expect(
            selectElements("li").at(2).property("className"),
            resolvesTo("selected-item")
          )
        })
      ]
    }).andThen({
      perform: [
        step("update the list state with another new selected item", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the selected item has the selected class", async () => {
          await expect(
            selectElements("li").at(3).property("className"),
            resolvesTo("selected-item")
          )
        })
      ]
    }).andThen({
      perform: [
        step("update the list state with another new selected item", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the selected item has the selected class", async () => {
          await expect(
            selectElements("li").at(0).property("className"),
            resolvesTo("selected-item")
          )
        })
      ]
    })
}

const pageState = container<PageState>({
  name: "page-state-container",
  initialValue: {
    type: "list",
    data: {
      items: ["apple", "pear", "grapes", "banana"]
    },
    selected: "pear"
  }
})

function staticList(state: State<ListState>): HTMLView {
  const selectedItem = derived({
    name: "selected-item",
    query: get => get(state).selected
  })

  const items = ["apple", "pear", "grapes", "banana"]

  return root => {
    root.ul(el => {
      for (const item of items) {
        el.children
          .li(el => {
            el.config
              .class(get => get(selectedItem) === item ? "selected-item" : "")
            el.children.textNode(item)
          })
      }
    })
  }
}

function listView(state: State<ListState>): HTMLView {
  const items = derived({
    name: "list-items",
    query: get => get(state).data.items
  })
  const selectedItem = derived({
    name: "selected-item",
    query: get => get(state).selected
  })

  return root => {
    root.ul(el => {
      el.children.subviews(get => get(items), (useData) => root => {
        root.li(el => {
          el.config
            .on("click", () => {
              return use(useData((item, get, index) => write(pageState, {
                type: "detail", detail: {
                  name: item,
                  content: getContent(get(index))
                }
              })))
            })
            .class(useData((item, get) => get(selectedItem) === item ? "selected-item" : ""))
          el.children.textNode(useData(item => item))
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
  selected: string
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