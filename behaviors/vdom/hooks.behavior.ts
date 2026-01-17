import { behavior, effect, example, fact, step } from "best-behavior";
import { renderContext } from "./helpers/renderContext";
import { container, derived, update, useContainerHooks, useHooks } from "@store/index";
import { HTMLView, UseData } from "@view/index";
import { selectElements } from "./helpers/displayElement";
import { expect, is, resolvesTo } from "great-expectations";

export default behavior("onRegister hook", [

  example(renderContext<HooksContext>())
    .description("list item view tokens trigger onRegister hook")
    .script({
      suppose: [
        fact("context is initialized", (context) => {
          context.setState({ logs: [] })
        }),
        fact("onRegister hook is used to add a container hook to each container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              const containerName = container.id !== undefined ? 
                `${container}-${actions.get(container.id)}` :
                `${container}`
              context.state.logs.push(`Registering [${containerName}]`)
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  context.state.logs.push(`Writing [${containerName}] => ${JSON.stringify(message)}`)
                  actions.ok(message)
                },
              })
            },
          })
        }),
        fact("a list of elements is displayed", (context) => {
          const items = container({
            name: "list-data",
            initialValue: ["One", "Two", "Three"]
          })

          function itemView(useItem: UseData<string>): HTMLView {
            const counter = container({
              name: "counter",
              initialValue: 0,
              id: derived(useItem(item => item.toLowerCase()))
            })

            return root => {
              root.div(el => {
                el.children
                  .h1(el => {
                    el.children
                      .textNode(useItem(item => item))
                      .textNode(" - ")
                      .textNode(get => `${get(counter)} clicks`)
                  })
                  .button(el => {
                    el.config.on("click", () => update(counter, val => val + 1))
                    el.children.textNode("Increment")
                  })
                  .hr()
              })
            }
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .subviews(get => get(items), itemView)
            })
          })
        })
      ],
      perform: [
        step("click some buttons", async () => {
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
        })
      ],
      observe: [
        effect("the view updates", async () => {
          await expect(selectElements("h1").texts(), resolvesTo([
            "One - 0 clicks",
            "Two - 3 clicks",
            "Three - 0 clicks",
          ]))
        }),
        effect("the logs are recorded", (context) => {
          expect(context.state.logs, is([
            "Registering [list-data]",
            "Registering [counter-one]",
            "Registering [counter-two]",
            "Registering [counter-three]",
            "Writing [counter-two] => 1",
            "Writing [counter-two] => 2",
            "Writing [counter-two] => 3",
          ]))
        })
      ]
    })

])

interface HooksContext {
  logs: Array<string>
}