import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { batch, container, Container, derived, DerivedState, use, useHooks, write } from "@store/index";
import { HTMLBuilder } from "@view/index";
import { selectElement } from "./helpers/displayElement";
import { expect, resolvesTo } from "great-expectations";

interface RegisterHookViewContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  calculated: DerivedState<string>
  queried: Container<string>
}

export default behavior("register hooks during a batch dispatched from a view", [

  example(renderContext<RegisterHookViewContext>())
    .description("a batch from a conditional view registers a view container whose register hook queries a derived value updated earlier in the batch")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setState({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            }),
            queried: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a register hook that supplies the derived value to the view container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              if (`${container}` === "view-container") {
                actions.supply(`supplied: ${actions.get(context.state.calculated)}`)
              }
            }
          })
        }),
        fact("a conditional view has a container that is only referenced by a batch message", (context) => {
          const showButton = container({ initialValue: true })

          function buttonView(root: HTMLBuilder) {
            const viewContainer = container({ name: "view-container", initialValue: "initial" })

            root.button(el => {
              el.config.on("click", () => batch([
                write(context.state.numberContainer, 27),
                use(get => write(context.state.queried, get(viewContainer)))
              ]))
              el.children.textNode("Update")
            })
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .p(el => {
                  el.config.dataAttribute("calculated")
                  el.children.textNode(get => get(context.state.calculated))
                })
                .p(el => {
                  el.config.dataAttribute("queried")
                  el.children.textNode(get => get(context.state.queried))
                })
                .subviewMatching(selector => {
                  selector.withConditions()
                    .when(get => get(showButton), buttonView)
                })
            })
          })
        })
      ],
      perform: [
        step("the button in the conditional view is clicked", async () => {
          await selectElement("button").click()
        })
      ],
      observe: [
        effect("the register hook sees the derived value that accounts for the earlier message in the batch", async () => {
          await expect(selectElement("[data-queried]").text(), resolvesTo(
            "supplied: 27 + hello = awesome!"
          ))
        })
      ]
    })

])
