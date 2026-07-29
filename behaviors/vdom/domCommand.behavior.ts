import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { command, CommandActions, CommandManager, Container, container, exec, use, useCommand, write } from "@store/index";
import { DomCommandActions, elementIdentifier, ElementIdentifier, withDomActions } from "@view/element";
import { selectElement } from "./helpers/displayElement";
import { arrayContaining, arrayWith, equalTo, expect, is, objectWithProperty, resolvesTo, stringContaining, throws } from "great-expectations";
import { useValue } from "../view/fixtures/helpers";
import { HTMLView, UseItem } from "@view/index";

interface CommandMessage {
  syncedElement: ElementIdentifier<HTMLInputElement>
}

const customDomCommand = command<CommandMessage>()
const inputState = container({ initialValue: "nothing" })

export default behavior("dom command manager", [

  example(renderContext())
    .description("getting an element that does not resolve in a custom command manager")
    .script({
      suppose: [
        fact("there is a command manager that can get elements", (app) => {
          app.useDomCommand(customDomCommand, (message, actions) => {
            const syncedElement = actions.getElement(message.syncedElement)
            syncedElement.focus()
          })
        }),
      ],
      observe: [
        effect("an error is thrown when a resolved identifier does not reference an element", (app) => {
          expect(() => {
            app.store.dispatch(exec(
              customDomCommand,
              { syncedElement: elementIdentifier() }
            ))
          }, throws(objectWithProperty("message", stringContaining("unknown element identifier"))))
        })
      ]
    }),

  example(renderContext())
    .description("command manager that can get elements")
    .script({
      suppose: [
        fact("there is a command manager that can get elements", (app) => {
          app.useDomCommand(customDomCommand, (message, actions) => {
            const text = actions.get(inputState)
            const syncedElement = actions.getElement(message.syncedElement)
            syncedElement.value = text
            syncedElement.focus()
          })
        }),
        fact("there is a view that invokes the command", (app) => {
          app.mountView(root => {
            const syncedElementId = elementIdentifier<HTMLInputElement>()
            root.main(el => {
              el.children
                .input(el => {
                  el.config
                    .type("text")
                    .dataAttribute("initial-input")
                    .on("input", useValue(val => write(inputState, val)))
                })
                .input(el => {
                  el.config
                    .elementIdentifier(syncedElementId)
                    .type("text")
                    .dataAttribute("synced-input")
                })
                .hr()
                .button(el => {
                  el.config.on("click", () => {
                    return exec(customDomCommand, {
                      syncedElement: syncedElementId
                    })
                  })
                  el.children.textNode("Sync inputs!")
                })
            })
          })
        })
      ],
      observe: [
        effect("the synced input is not focused", async () => {
          await expect(
            selectElement("input[data-synced-input]").isFocused(),
            resolvesTo(false)
          )
        }),
        effect("the synced input value is empty", async () => {
          await expect(
            selectElement("input[data-synced-input]").inputValue(),
            resolvesTo("")
          )
        })
      ]
    }).andThen({
      perform: [
        step("type some text in the input", async () => {
          await selectElement("input[data-initial-input]").type("Something cool!")
        }),
        step("click the button to focus the element and transfer the text", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the synced input is focused", async () => {
          await expect(
            selectElement("input[data-synced-input]").isFocused(),
            resolvesTo(true)
          )
        }),
        effect("the synced input value has the value from the other input", async () => {
          await expect(selectElement("input[data-synced-input]").inputValue(), resolvesTo("Something cool!"))
        })
      ]
    }),

  (m) => m.pick() && example(renderContext<DisconnectionContext>())
    .description("dom command manager that tracks element disconnection")
    .script({
      suppose: [
        fact("there is a command manager that tracks mutation", (app) => {
          useCommand(app.store, onDisconnectElement, withDomActions(new DomMutationManager()))
        }),
        fact("there is state", (app) => {
          app.setState({
            disconnections: [],
            listData: container({ initialValue: ["one", "two", "three"] })
          })
        }),
        fact("there is a view with a list", (app) => {
          function itemView(useItem: UseItem<string>): HTMLView {
            const id = elementIdentifier()

            return root => {
              root.div(el => {
                el.children
                  .h1(el => {
                    el.config.elementIdentifier(id)
                    el.children.textNode(useItem(item => item.data))
                  })
                  .button(el => {
                    el.config.dataAttribute("item", useItem(item => item.data))
                      .on("click", () => {
                        return use(useItem(item => exec(onDisconnectElement, {
                          element: id,
                          effect: () => {
                            app.state.disconnections.push(item.data)
                          }
                        })))
                      })
                    el.children.textNode("Click to alert on disconnect")
                  })
              })
            }
          }

          app.mountView(root => {
            root.main(el => {
              el.config.id("app-root")
              el.children.subviews(get => get(app.state.listData), itemView)
            })
          })
        })
      ],
      perform: [
        step("select some elements to be notified on disconnect", async () => {
          await selectElement("button[data-item='two']").click()
          await selectElement("button[data-item='three']").click()
        }),
        step("update the list data to remove some elements", (app) => {
          app.writeTo(app.state.listData, ["one", "seven", "nine"])
        })
      ],
      observe: [
        effect("the disconnection effects were called", (app) => {
          expect(app.state.disconnections, is(arrayWith([
            equalTo("two"), equalTo("three")
          ], { withAnyOrder: true })))
        })
      ]
    })

])

interface DisconnectionContext {
  disconnections: Array<string>
  listData: Container<Array<string>>
}

interface DisconnectElementConfig {
  element: ElementIdentifier
  effect: () => void
}

const onDisconnectElement = command<DisconnectElementConfig>()

class DomMutationManager implements CommandManager<DisconnectElementConfig> {
  private effectRegistry: Map<Element, () => void> = new Map()
  private observer: MutationObserver | undefined

  exec(message: DisconnectElementConfig, actions: DomCommandActions): void {
    if (this.effectRegistry.size === 0) {
      this.startObserving()
    }

    this.effectRegistry.set(actions.getElement(message.element), message.effect)
  }

  private checkConnection() {
    for (const [element, effect] of this.effectRegistry.entries()) {
      if (!element.isConnected) {
        effect()
        this.effectRegistry.delete(element)
      }
    }
  }

  private startObserving() {
    this.observer = new MutationObserver(() => {
      this.checkConnection()
      if (this.effectRegistry.size === 0) {
        this.observer?.disconnect()
        this.observer = undefined
      }
    })

    this.observer.observe(document.querySelector("#app-root")!, {
      attributes: false,
      childList: true,
      subtree: true
    })
  }

}