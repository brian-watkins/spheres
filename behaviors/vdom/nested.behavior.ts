import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { HTMLBuilder, HTMLView } from "@view/htmlElements";
import { update, use, write } from "@store/message";
import { Container, container, derived, useContainerHooks, useHooks } from "@store/index";
import { UseCase, UseItem } from "@view/index";
import { selectElements, selectElementWithText } from "./helpers/displayElement";
import { expect, is, resolvesTo } from "great-expectations";

export default behavior("nested templates", [

  example(renderContext<{ logs: Array<string> }>())
    .description("registering nested containers")
    .script({
      suppose: [
        fact("setup state", (context) => {
          context.setState({ logs: [] })
        }),
        fact("onRegister hook is used to add a container hook to each container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              const containerValue = actions.get(container)
              const containerName = containerValue.id !== undefined ?
                `${container}-${containerValue.id}` :
                `${container}`
              context.state.logs.push(`Registering [${containerName}]`)
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  if (containerName.includes("item-counter")) {
                    context.state.logs.push(`Writing [${containerName}] => ${message.count}`)
                  }
                  actions.ok(message)
                },
              })
            },
          })
        }),
        fact("there is a view", (context) => {
          context.mountView(strangeView)
        })
      ],
      perform: [
        step("click a list item container", async () => {
          await selectElements("button[data-counter]").at(1).click()
          await selectElements("button[data-counter]").at(1).click()
          await selectElements("button[data-counter]").at(1).click()
        })
      ],
      observe: [
        effect("the count increases", async () => {
          await expect(selectElements("[data-counter-text]").at(1).text(), resolvesTo("3"))
        }),
        effect("the container hooks were called", (context) => {
          expect(context.state.logs, is([
            "Registering [view-state]",
            "Registering [cool-name]",
            "Registering [item-counter-0]",
            "Registering [item-counter-1]",
            "Registering [item-counter-2]",
            "Writing [item-counter-1] => 1",
            "Writing [item-counter-1] => 2",
            "Writing [item-counter-1] => 3",
          ]))
        })
      ]
    }),

  example(renderContext())
    .description("list inside select depending on outside derived state")
    .script({
      suppose: [
        fact("there is a view", (context) => {
          context.mountView(strangeView)
        })
      ],
      perform: [
        step("cycle through some cool items", async () => {
          await selectElementWithText("Cycle").click()
        })
      ],
      observe: [
        effect("the cool indicator updated", async () => {
          await expect(selectElements("[data-cool-text]").texts(), resolvesTo([
            "one []",
            "four [COOL]",
            "seven []"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("visit the detail page", async () => {
          await selectElementWithText("four").click()
        }),
        step("return to the list", async () => {
          await selectElementWithText("Return").click()
        }),
        step("move the cool indicator", async () => {
          await selectElementWithText("Cycle").click()
        })
      ],
      observe: [
        effect("the cool indicator updated", async () => {
          await expect(selectElements("[data-cool-text]").texts(), resolvesTo([
            "one []",
            "four []",
            "seven [COOL]"
          ]))
        })
      ]
    })

])

interface DetailViewState {
  type: "detail-view"
  item: string
}

interface List {
  items: Array<string>
  coolName: Container<string>
}

interface ListViewState {
  type: "list-view"
  list: List,
}

type ViewState = DetailViewState | ListViewState

const items: ListViewState = {
  type: "list-view",
  list: {
    items: ["one", "four", "seven"],
    coolName: container({ name: "cool-name", initialValue: "one" })
  }
}

const viewState = container<ViewState>({ name: "view-state", initialValue: items })

function detailView(useCase: UseCase<DetailViewState>): HTMLView {
  return (root) => {
    root.div(el => {
      el.children
        .h1(el => {
          el.children
            .textNode("DETAILS")
        })
        .hr()
        .div(el => {
          el.children.textNode(useCase(state => state.item))
        })
        .button(el => {
          el.config.on("click", () => write(viewState, items))
          el.children.textNode("Return")
        })
    })
  }
}

function listView(useCase: UseCase<ListViewState>): HTMLView {
  return (root) => {
    root.div(el => {
      el.children
        .h1(el => {
          el.children
            .textNode("ITEMS")
        })
        .hr()
        .div(el => {
          el.children
            .ul(el => {
              el.children.subviews(useCase(state => state.list.items), listItemView)
            })
            .hr()
            .button(el => {
              el.config.on("click", () => use(useCase(state => update(state.list.coolName, val => val + "!"))))
              el.children.textNode("Cycle")
            })
        })
    })
  }
}

const coolIndex = derived({
  name: "cool-index",
  query: get => {
    const view = get(viewState)
    if (view.type === "list-view") {
      return get(view.list.coolName).length % 3 + 3
    } else {
      return -1
    }
  }
})

function listItemView(useItem: UseItem<string>): HTMLView {
  const isCool = derived({
    name: "isCool",
    query: useItem((item, get) => {
      return get(coolIndex) === item.data.length
    })
  })

  const counter = container({
    name: "item-counter",
    initialValue: useItem((item) => ({ count: 0, id: item.index }))
  })

  return (root) => {
    root.li(el => {
      el.children
        .div(el => {
          el.config
            .dataAttribute("cool-text")
            .on("click", () => {
              return use(useItem(item => write(viewState, { type: "detail-view", item: item.data })))
            })
          el.children
            .span(el => {
              el.children.textNode(useItem(item => item.data))
            })
            .span(el => {
              el.children.textNode(get => get(isCool) ? " [COOL]" : " []")
            })
        })
        .div(el => {
          el.config.dataAttribute("counter-text")
          el.children.textNode(get => `${get(counter).count}`)
        })
        .button(el => {
          el.config
            .dataAttribute("counter")
            .on("click", () => update(counter, val => ({ ...val, count: val.count + 1 })))
          el.children.textNode("Click")
        })
    })
  }
}

function strangeView(root: HTMLBuilder) {
  root.main(el => {
    el.children.subviewMatching(selector => {
      selector.withUnion(get => get(viewState))
        .when(val => val.type === "detail-view", detailView)
        .when(val => val.type === "list-view", listView)
    })
  })
}