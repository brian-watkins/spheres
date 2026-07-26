import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { selectElement } from "./helpers/displayElement";
import { command, container, Container, exec, State, update, use, useCommand } from "@store/index";
import { HTMLView, UseItem } from "@view/index";
import { expect, is } from "great-expectations";

interface TallyCommandArgs {
  id: string
  tally: State<number>
}

interface SavedTally {
  id: string
  tally: number
}

interface ListCommandContext {
  listContainer: Container<Array<string>>
  savedTallies: Array<SavedTally>
}

interface IncrementCommandArgs {
  tally: Container<number>
}

interface ListDispatchCommandContext {
  listContainer: Container<Array<string>>
}

const saveCommand = command<TallyCommandArgs>()

const incrementCommand = command<IncrementCommandArgs>()

export default behavior("command in list", [

  example(renderContext<ListCommandContext>())
    .description("command that uses state defined in a list item view")
    .script({
      suppose: [
        fact("there is state with a list and saved tallies storage", (context) => {
          const savedTallies: Array<SavedTally> = []
          useCommand(context.store, saveCommand, {
            exec: (message, { get }) => {
              savedTallies.push({
                id: message.id,
                tally: get(message.tally)
              })
            }
          })

          context.setState({
            listContainer: container({ initialValue: ["item-1", "item-2", "item-3"] }),
            savedTallies
          })
        }),
        fact("there is a list view with a tally and a save button for each item", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const tally = container({ initialValue: 0 })
            
            return (root) => {
              root.li(el => {
                el.config.dataAttribute("list-item", stateful(item => item.data))
                el.children
                  .span(el => {
                    el.config.dataAttribute("tally", stateful(item => item.data))
                    el.children.textNode(get => `Total: ${get(tally)}`)
                  })
                  .button(el => {
                    el.config.dataAttribute("increment-button", stateful(item => item.data))
                    el.config.on("click", () => update(tally, val => val + 1))
                    el.children.textNode("Increment")
                  })
                  .button(el => {
                    el.config.dataAttribute("save-button", stateful(item => item.data))
                    el.config.on("click", () => use(stateful((item) =>
                      exec(saveCommand, { id: item.data, tally })
                    )))
                    el.children.textNode("Save")
                  })
              })
            }
          }

          context.mountView((root) => {
            root.ul(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      perform: [
        step("increment the tally for one of the items", async () => {
          await selectElement("[data-increment-button='item-2']").click()
          await selectElement("[data-increment-button='item-2']").click()
        }),
        step("click save on that item", async () => {
          await selectElement("[data-save-button='item-2']").click()
        }),
        step("increment the tally for another of the items", async () => {
          await selectElement("[data-increment-button='item-3']").click()
          await selectElement("[data-increment-button='item-3']").click()
          await selectElement("[data-increment-button='item-3']").click()
        }),
        step("click save on that item", async () => {
          await selectElement("[data-save-button='item-3']").click()
        }),
      ],
      observe: [
        effect("the command records the tally and id from the saved item view state", (context) => {
          expect(context.state.savedTallies, is([
            { id: "item-2", tally: 2 },
            { id: "item-3", tally: 3 }
          ]))
        })
      ]
    }),

  example(renderContext<ListDispatchCommandContext>())
    .description("command that dispatches a message for state defined in a list item view")
    .script({
      suppose: [
        fact("there is a command that dispatches an update message for the tally", (context) => {
          useCommand(context.store, incrementCommand, {
            exec: (message, { dispatch }) => {
              dispatch(update(message.tally, (current) => current + 1))
            }
          })

          context.setState({
            listContainer: container({ initialValue: ["item-1", "item-2", "item-3"] })
          })
        }),
        fact("there is a list view with a tally and an increment button for each item", (context) => {
          function itemView(stateful: UseItem<string>): HTMLView {
            const tally = container({ initialValue: 0 })

            return (root) => {
              root.li(el => {
                el.config.dataAttribute("list-item", stateful(item => item.data))
                el.children
                  .h1(el => {
                    el.config.dataAttribute("tally", stateful(item => item.data))
                    el.children.textNode(get => `Total: ${get(tally)}`)
                  })
                  .button(el => {
                    el.config.dataAttribute("increment-button", stateful(item => item.data))
                    el.config.on("click", () => exec(incrementCommand, { tally }))
                    el.children.textNode("Increment")
                  })
              })
            }
          }

          context.mountView((root) => {
            root.ul(el => {
              el.children.subviews(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      perform: [
        step("increment the tally for one of the items", async () => {
          await selectElement("[data-increment-button='item-2']").click()
          await selectElement("[data-increment-button='item-2']").click()
        }),
        step("increment the tally for another of the items", async () => {
          await selectElement("[data-increment-button='item-3']").click()
          await selectElement("[data-increment-button='item-3']").click()
          await selectElement("[data-increment-button='item-3']").click()
        })
      ],
      observe: [
        effect("the tally for the item that was not incremented is unchanged", async () => {
          expect(await selectElement("[data-tally='item-1']").text(), is("Total: 0"))
        }),
        effect("the tally text updates for the items that were incremented", async () => {
          expect(await selectElement("[data-tally='item-2']").text(), is("Total: 2"))
          expect(await selectElement("[data-tally='item-3']").text(), is("Total: 3"))
        })
      ]
    })

])
