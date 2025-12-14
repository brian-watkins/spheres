import { behavior, effect, example, fact, step } from "best-behavior";
import { RenderApp, renderContext } from "./helpers/renderContext";
import { batch, container, Container, derived, State, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.selected-item { color: #f00; }';
document.getElementsByTagName('head')[0].appendChild(style);

export default behavior("view of discriminated union state", [

  discriminatedUnionSwitchViewExample("client rendered", (context, view) => context.mountView(view)),
  discriminatedUnionSwitchViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  discriminatedUnionReuseViewExample("client rendered", (context, view) => context.mountView(view)),
  discriminatedUnionReuseViewExample("server rendered", (context, view) => context.ssrAndActivate(view)),

  example(renderContext<Container<PageState>>())
    .description("selecting from union with default case")
    .script({
      suppose: [
        fact("some list items are set", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items", items: [
              "apple", "pear", "grapes", "banana"
            ], selected: ""
          })
        }),
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listOrEmptyView)
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
    .description("current union case remains the same but other values change")
    .script({
      suppose: [
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listOrEmptyView)
                    .default(defaultView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the view for initial state is displayed", async () => {
          await expect(selectElement("h1").text(), resolvesTo("EMPTY LIST!"))
        })
      ]
    }).andThen({
      perform: [
        step("add items to the list", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items", items: [
              "apple", "pear", "grapes", "banana"
            ], selected: "pear"
          })
        })
      ],
      observe: [
        effect("the view for the list items is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "apple", "pear", "grapes", "banana"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the value on the discriminant", (context) => {
          context.writeTo(pageState, {
            type: "list",
            data: anotherListDataState
          })
        })
      ],
      observe: [
        effect("the updated list is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "a", "b", "c"
          ]))
        })
      ]
    }),

  example(renderContext<Container<PageState>>())
    .description("select view of select views")
    .script({
      suppose: [
        fact("some list items are set", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items", items: [
              "apple", "pear", "grapes", "banana"
            ], selected: ""
          })
        }),
        fact("a view that renders the discriminated union state", (context) => {
          context.mountView(root => {
            root.main(el => {
              el.children
                .subviewFrom(selector => {
                  selector.withUnion(pageState)
                    .when(page => page.type === "list", listOrEmptyView)
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
        step("items are updated", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items", items: [
              "a", "b", "c"
            ], selected: "a"
          })
        }),
        step("return to the list view", context => {
          context.writeTo(pageState, { type: "list", data: listDataState })
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
                    .when(page => page.type === "list", listOrEmptyView)
                    .when(page => page.type === "detail", detailView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the empty list view is displayed", async () => {
          await expect(selectElement("h1").text(), resolvesTo("EMPTY LIST!"))
        })
      ]
    }).andThen({
      perform: [
        step("populate the list", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items",
            items: ["apple", "pear", "grapes", "banana"],
            selected: "pear"
          })
        })
      ],
      observe: [
        effect("the view for the list is displayed", async () => {
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
        step("update the list items", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items",
            items: ["truck", "car", "boat"],
            selected: "truck"
          })
        })
      ],
      observe: [
        effect("the view for the list is displayed", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "truck", "car", "boat"
          ]))
        }),
        effect("the selected item is selected", async () => {
          await expect(selectElements("li").at(0).property("className"), resolvesTo("selected-item"))
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
          await expect(selectElement("[data-detail-name]").text(), resolvesTo("boat has 4 characters"))
        })
      ]
    }).andThen({
      perform: [
        step("return to the list view", async () => {
          await selectElement("[data-detail-name]").click()
        }),
        step("update the list", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items",
            items: ["hat", "coat", "pants"],
            selected: "coat"
          })
        })
      ],
      observe: [
        effect("the view updates accordingly", async () => {
          await expect(selectElements("li").texts(), resolvesTo([
            "hat", "coat", "pants"
          ]))
        }),
        effect("the selected item is selected", async () => {
          await expect(selectElements("li").at(1).property("className"), resolvesTo("selected-item"))
        })
      ]
    }).andThen({
      perform: [
        step("update the data for the current view", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items",
            items: ["red", "orange", "blue", "green"],
            selected: "green"
          })
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

function discriminatedUnionReuseViewExample(name: string, renderer: (context: RenderApp<Container<PageState>>, view: HTMLView) => void) {
  return example(renderContext<Container<PageState>>())
    .description(`view based on selector with a single case (${name})`)
    .script({
      suppose: [
        fact("some list items are set", (context) => {
          context.writeTo(listDataState, {
            type: "list-with-items", items: [
              "apple", "pear", "grapes", "banana"
            ], selected: "pear"
          })
        }),
        fact("a view that renders the discriminated union state", (context) => {
          renderer(context, root => {
            root.main(el => {
              el.children
                .button(el => {
                  el.config.on("click", () => {
                    return use(get => {
                      const state = get(pageState)
                      if (state.type === "list") {
                        const listState = get(state.data)
                        if (listState.type === "list-with-items") {
                          const i = listState.items.findIndex((item) => item === listState.selected)
                          const next = listState.items[(i + 1) % listState.items.length]
                          return write(state.data, { ...listState, selected: next })
                        } else {
                          return batch([])
                        }
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

const listDataState = container<ListData>({
  initialValue: { type: "empty-list" }
})

const anotherListDataState = container<ListData>({
  initialValue: { type: "list-with-items", items: ["a", "b", "c"], selected: "c" }
})

const pageState = container<PageState>({
  name: "page-state-container",
  initialValue: {
    type: "list",
    data: listDataState
  }
})

function staticList(state: State<ListState>): HTMLView {
  const selectedItem = derived({
    name: "selected-item",
    query: get => {
      const listState = get(get(state).data)
      return listState.type === "list-with-items" ? listState.selected : undefined
    }
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

function listOrEmptyView(state: State<ListState>): HTMLView {
  const listData = derived(get => get(get(state).data))

  return (root) => {
    root.subviewFrom(selector => {
      selector.withUnion(listData)
        .when(state => state.type === "list-with-items", listView)
        .when(state => state.type === "empty-list", () => root => {
          root.h1(el => el.children.textNode("EMPTY LIST!"))
        })
    })
  }
}

function listView(state: State<ListWithItems>): HTMLView {
  const items = derived({
    name: "list-items",
    query: get => get(state).items
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
            .class(useData((item, get) => {
              const selected = get(selectedItem)
              return selected === item ? "selected-item" : ""
            }))
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
      el.config
        .dataAttribute("detail-name")
        .on("click", () => write(pageState, { type: "list", data: listDataState }))
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

interface ListWithItems {
  type: "list-with-items"
  items: Array<string>
  selected: string
}

interface EmptyList {
  type: "empty-list"
}

type ListData = ListWithItems | EmptyList

interface ListState {
  type: "list"
  data: Container<ListData>
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