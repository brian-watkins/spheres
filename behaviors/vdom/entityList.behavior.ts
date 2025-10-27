import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { batch, container, entity, Entity, GetState, update, use, write } from "@store/index";
import { HTMLView } from "@view/htmlElements";
import { selectElement, selectElements } from "./helpers/displayElement";
import { assignedWith, expect, resolvesTo, stringContaining } from "great-expectations";
import { EntityRef } from "@store/state/entity";

interface Item {
  id: string
  label: string
  isSelected: boolean
}

interface ListState {
  items: Entity<Array<Item>>
}

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.selected-item { color: #f00; }';
document.getElementsByTagName('head')[0].appendChild(style);

export default behavior("entity list", [

  example(renderContext<ListState>())
    .description("list of entities")
    .script({
      suppose: [
        fact("there is list state", (context) => {
          context.setState({
            items: entity({ initialValue: buildItems(3) })
          })
        }),
        fact("a list of elements is displayed based on the state", (context) => {
          const selected = container<Entity<boolean> | undefined>({ initialValue: undefined })

          function selectRow(entity: Entity<Item>, get: GetState) {
            console.log("A")
            const previouslySelected = get(selected)
            console.log("B")
            // Not great that we have to do this ... should fix
            const isSelected = entity.isSelected
            if (previouslySelected === undefined) {
              console.log("C")

              return batch([
                //@ts-ignore
                write(isSelected, true),
                write(selected, isSelected)
              ])
            } else {
              return batch([
                //@ts-ignore
                write(isSelected, true),
                write(previouslySelected, false),
                write(selected, isSelected)
              ])
            }
          }

          function itemView(item: EntityRef<Item>): HTMLView {
            return root => {
              root.li(el => {
                el.config
                  .dataAttribute("item", get => get(item.id))
                  .on("click", () => use(get => selectRow(get(item.$self), get)))
                  .class(get => get(item.isSelected) ? "selected-item" : undefined)
                el.children
                  .textNode(get => get(item.label))
              })
            }
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .ul(el => {
                  el.children.entityViews(() => context.state.items, itemView)
                })
                .button(el => {
                  el.config.on("click", () => update(context.state.items[1].label, val => `${val} !!!`))
                  el.children.textNode("Click!")
                })
            })
          })
        })
      ],
      observe: [
        effect("the items are displayed", async () => {
          await expect(selectElements("[data-item]").count(), resolvesTo(3))
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
        })
      ]
    }).andThen({
      perform: [
        step("click to update a label", async () => {
          await selectElement("button").click()
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the label on the targeted item updates", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 !!! !!!"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
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
          //@ts-ignore
          // context.writeTo(context.state.items, buildEntities(6))
          context.store.dispatch(update(context.state.items, (val) => {
            console.log("updateing", val)
            return [...val, ...buildItems(3, 3)]
          }))
        })
      ],
      observe: [
        effect("there are 3 new items in the list", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 !!! !!!"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4"))
          await expect(selectElement("[data-item='5']").text(), resolvesTo("label-5"))
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
          // @ts-ignore
          context.store.dispatch(update(context.state.items, (val) => {
            const updated = [...val]
            const item = val[4]
            updated[4] = updated[1]
            updated[1] = item
            return updated
          }))
        }),
      ],
      observe: [
        effect("the item labels are updated", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 !!! !!!"))
          await expect(selectElement("[data-item='5']").text(), resolvesTo("label-5"))
        })
      ]
    }).andThen({
      perform: [
        step("click to update the label", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("only the second item's label updates", async () => {
          await expect(selectElement("[data-item='0']").text(), resolvesTo("label-0"))
          await expect(selectElement("[data-item='4']").text(), resolvesTo("label-4 !!!"))
          await expect(selectElement("[data-item='2']").text(), resolvesTo("label-2"))
          await expect(selectElement("[data-item='3']").text(), resolvesTo("label-3"))
          await expect(selectElement("[data-item='1']").text(), resolvesTo("label-1 !!! !!!"))
          await expect(selectElement("[data-item='5']").text(), resolvesTo("label-5"))
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
          await expect(selectElement("[data-item='2']").property("className"),resolvesTo(""))
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
      label: `label-${i}`,
      isSelected: false
    })
  }
  return entites
}