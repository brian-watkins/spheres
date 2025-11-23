import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { batch, Container, container, update, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { assignedWith, expect, resolvesTo, stringContaining } from "great-expectations";
import { UseData } from "@view/index";
import { StateReference } from "@store/tokenRegistry";

interface Item {
  id: string
  label: string
}

interface ListState {
  items: Container<Array<Item>>
}

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.selected-item { color: #f00; }';
document.getElementsByTagName('head')[0].appendChild(style);

export default behavior("list data", [

  example(renderContext<ListState>())
    .description("operating on data in a list")
    .script({
      suppose: [
        fact("there is list state", (context) => {
          context.setState({
            items: container({
              initialValue: buildItems(3),
            })
          })
        }),
        fact("a list of elements is displayed based on the state", (context) => {
          const selected = container<StateReference<Item> | undefined>({ initialValue: undefined })

          function selectRow(item: StateReference<Item>) {
            return batch([
              write(selected, item)
            ])
          }

          function itemView(useData: UseData<Item>): HTMLView {
            return root => {
              root.li(el => {
                el.config
                  .dataAttribute("item", useData((get, item) => get(item).id))
                  .on("click", () => use(useData((_, item) => selectRow(item))))
                  .class(useData((get, item) => {
                    const sel = get(selected)
                    if (sel === undefined) return ""
                    return get(item).id === get(sel).id ? "selected-item" : ""
                  }))
                el.children
                  .textNode(useData((get, item, index) => `${get(item).label} => ${get(index)}`))
              })
            }
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .ul(el => {
                  el.children.subviews((get) => get(context.state.items), itemView)
                })
            })
          })
        })
      ],
      observe: [
        effect("the items are displayed", async () => {
          await expect(selectElements("[data-item]").count(), resolvesTo(3))
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0 => 0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 => 1"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2 => 2"))
        })
      ]
    }).andThen({
      perform: [
        step("an item is selected", async () => {
          await selectElement("[data-item='1']").click()
        })
      ],
      observe: [
        effect("only the selected item is selected", async () => {
          await expect(selectElement("[data-item='0']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='1']").property("className"),
            resolvesTo(assignedWith(stringContaining("selected-item"))))
          await expect(selectElement("[data-item='2']").property("className"), resolvesTo(""))
        })
      ]
    }).andThen({
      perform: [
        step("select a different item", async () => {
          await selectElement("[data-item='2']").click()
        })
      ],
      observe: [
        effect("only the selected item is selected", async () => {
          await expect(selectElement("[data-item='0']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='1']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='2']").property("className"),
            resolvesTo(assignedWith(stringContaining("selected-item"))))
        })
      ]
    }).andThen({
      perform: [
        step("add some items to the list", (context) => {
          context.store.dispatch(update(context.state.items, (val) => {
            return [...val, ...buildItems(3, 3)]
          }))
        })
      ],
      observe: [
        effect("there are 3 new items in the list", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0 => 0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 => 1"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2 => 2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3 => 3"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4 => 4"))
          await expect(selectElement("[data-item='5']").text(), resolvesTo("label-5 => 5"))
        }),
        effect("the third item is still the only one selected", async () => {
          await expect(selectElement("[data-item='0']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='1']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='2']").property("className"),
            resolvesTo(assignedWith(stringContaining("selected-item"))))
          await expect(selectElement("[data-item='3']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='4']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='5']").property("className"), resolvesTo(""))
        })
      ]
    }).andThen({
      perform: [
        step("items are rearranged", (context) => {
          context.store.dispatch(update(context.state.items, (val) => {
            return [
              val[0],
              val[4],
              val[2],
              val[3],
              val[1],
              val[5]
            ]
          }))
        }),
      ],
      observe: [
        effect("the item labels are updated", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0 => 0"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4 => 1"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2 => 2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3 => 3"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 => 4"))
          await expect(selectElement("[data-item='5']").text(), resolvesTo("label-5 => 5"))
        }),
        effect("the third item is still the only one selected", async () => {
          await expect(selectElement("[data-item='0']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='4']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='2']").property("className"),
            resolvesTo(assignedWith(stringContaining("selected-item"))))
          await expect(selectElement("[data-item='3']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='1']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='5']").property("className"), resolvesTo(""))
        })
      ]
    }).andThen({
      perform: [
        step("select a different item", async () => {
          await selectElement("[data-item='1']").click()
        })
      ],
      observe: [
        effect("the selected item is selected", async () => {
          await expect(selectElement("[data-item='0']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='4']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='2']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='3']").property("className"), resolvesTo(""))
          await expect(selectElement("[data-item='1']").property("className"),
            resolvesTo(assignedWith(stringContaining("selected-item"))))
          await expect(selectElement("[data-item='5']").property("className"), resolvesTo(""))
        })
      ]
    })

])

function buildItems(count: number, startAt: number = 0): Array<Item> {
  const entites: Array<Item> = []
  for (let i = startAt; i < count + startAt; i++) {
    entites.push({
      id: `${i}`,
      label: `label-${i}`
    })
  }
  return entites
}