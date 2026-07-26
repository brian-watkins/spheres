import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { command, container, exec, write } from "@store/index";
import { elementIdentifier, ElementIdentifier } from "@view/element";
import { selectElement } from "./helpers/displayElement";
import { expect, objectWithProperty, resolvesTo, stringContaining, throws } from "great-expectations";
import { useValue } from "../view/fixtures/helpers";

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
    })

])