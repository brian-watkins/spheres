import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { batch, Container, container, update, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { assignedWith, expect, resolvesTo, stringContaining } from "great-expectations";
import { UseItem } from "@view/index";

interface Item {
  id: string
  label: string
}

interface ListState {
  items: Container<Array<Item>>
}

interface RemoveMessage {
  type: "remove",
  index: number
}

interface SetMessage {
  type: "set",
  value: Array<Item>
}

type ListMessage = RemoveMessage | SetMessage

interface ListMessageState {
  items: Container<Array<Item>, ListMessage>
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
          const selected = container<Item | undefined>({ initialValue: undefined })

          function selectRow(item: Item) {
            return batch([
              write(selected, item)
            ])
          }

          function itemView(useData: UseItem<Item>): HTMLView {
            return root => {
              root.li(el => {
                el.config
                  .dataAttribute("item", useData(({ data }) => data.id))
                  .on("click", () => use(useData(({ data }) => selectRow(data))))
                  .class(useData(({ data }, get) => {
                    const sel = get(selected)
                    if (sel === undefined) return ""
                    return data.id === sel.id ? "selected-item" : ""
                  }))
                el.children
                  .textNode(useData(({ data, index }) => `${data.label} => ${index}`))
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
    }),

  example(renderContext<ListMessageState>())
    .description("deleting data in a list by index, when the index is not subscribed to")
    .script({
      suppose: [
        fact("there is list state", (context) => {
          context.setState({
            items: container({
              initialValue: buildItems(5),
              update(message, current) {
                if (message.type === "remove") {
                  return { value: current.toSpliced(message.index, 1) }
                } else {
                  return { value: current }
                }
              },
            })
          })
        }),
        fact("a list of elements is displayed based on the state", (context) => {
          function itemView(useData: UseItem<Item>): HTMLView {
            return root => {
              root.li(el => {
                el.config
                  .dataAttribute("item", useData(({ data }) => data.id))
                  .on("click", () => use(useData(row => {
                    return write(context.state.items, { type: "remove", index: row.index })
                  })))
                el.children
                  .textNode(useData(({ data }) => `${data.label}`))
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
          await expect(selectElements("[data-item]").count(), resolvesTo(5))
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4"))
        })
      ]
    }).andThen({
      perform: [
        step("delete some elements", async () => {
          await selectElement("[data-item='1']").click()
          await selectElement("[data-item='3']").click()
        })
      ],
      observe: [
        effect("the elements are removed", async () => {
          await expect(selectElements("[data-item]").count(), resolvesTo(3))
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4"))
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