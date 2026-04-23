import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { HTMLBuilder, HTMLView } from "@view/htmlElements";
import { update, use, write } from "@store/message";
import { Container, container, derived } from "@store/index";
import { UseCase, UseData } from "@view/index";
import { selectElements, selectElementWithText } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

export default behavior("nested templates", [

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
          await expect(selectElements("li").texts(), resolvesTo([
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
          await expect(selectElements("li").texts(), resolvesTo([
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
    coolName: container({ initialValue: "one" })
  }
}

const viewState = container<ViewState>({ initialValue: items })

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

function listItemView(useItem: UseData<string>): HTMLView {
  const isCool = derived({
    name: "isCool",
    query: useItem((item, get) => {
      return get(coolIndex) === item.length
    })
  })

  return (root) => {
    root.li(el => {
      el.config.on("click", () => {
        return use(useItem(item => write(viewState, { type: "detail-view", item })))
      })
      el.children
        .span(el => {
          el.children.textNode(useItem(item => item))
        })
        .span(el => {
          el.children.textNode(get => get(isCool) ? " [COOL]" : " []")
        })
    })
  }
}

function strangeView(root: HTMLBuilder) {
  root.main(el => {
    el.children.subviewFrom(selector => {
      selector.withUnion(get => get(viewState))
        .when(val => val.type === "detail-view", detailView)
        .when(val => val.type === "list-view", listView)
    })
  })
}