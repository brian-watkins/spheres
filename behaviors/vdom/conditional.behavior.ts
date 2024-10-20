import { container, Container, update } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { HTMLView } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "helpers/displayElement";
import { renderContext } from "helpers/renderContext";

export default behavior("conditional zone", [

  example(renderContext<Container<boolean>>())
    .description("start hidden, then show")
    .script({
      suppose: [
        fact("there is boolean state", (context) => {
          context.setState(container({ initialValue: false }))
        }),
        fact("there is a view that is conditional", (context) => {
          function conditionalView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode("I am visible now!")
            })
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .zoneWhich(get => get(context.state) ? "conditionalView" : undefined, {
                  conditionalView
                })
            })
          })
        })
      ],
      observe: [
        effect("the view is not visible", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("the state changes to show the view", (context) => {
          context.writeTo(context.state, true)
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("I am visible now!"))
        })
      ]
    }).andThen({
      perform: [
        step("the state changes to hide the view", (context) => {
          context.writeTo(context.state, false)
        })
      ],
      observe: [
        effect("the view is no longer visible", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    }),

  example(renderContext<Container<number>>())
    .description("conditional zone that depends on state in the query")
    .script({
      suppose: [
        fact("there is state", (context) => {
          context.setState(container({ initialValue: 0 }))
        }),
        fact("there is a view that is conditional", (context) => {
          function conditionalView(root: HTMLBuilder) {
            root.p(el => {
              el.children.textNode(get => `Counter is even: ${get(context.state)}`)
            })
          }

          context.mountView(root => {
            root.div(el => {
              el.children
                .zoneWhich(get => get(context.state) % 2 === 0 ? "conditionalView" : undefined, {
                  conditionalView
                })
            })
          })
        })
      ],
      observe: [
        effect("the view is visible", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 0"))
        })
      ]
    }).andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state, 3)
        })
      ],
      observe: [
        effect("the view updates to hide the view", async () => {
          await expect(selectElement("p").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state, 8)
        })
      ],
      observe: [
        effect("the view updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Counter is even: 8"))
        })
      ]
    }),

  example(renderContext<Container<boolean>>())
    .description("multiple conditional views with events")
    .script({
      suppose: [
        fact("there is some boolean state", (context) => {
          context.setState(container({ initialValue: false }))
        }),
        fact("there are multiple conditional views with events", (context) => {
          const aCounter = container({ initialValue: 0 })
          const bCounter = container({ initialValue: 0 })

          function counterView(counter: Container<number>): HTMLView {
            return root => root.div(el => {
              el.children
                .p(el => el.children.textNode(get => `Total: ${get(counter)}`))
                .button(el => {
                  el.config
                    .on("click", () => update(counter, (val) => val + 1))
                  el.children.textNode("Click me!")
                })
            })
          }

          context.mountView(root => {
            root.main(el => {
              el.children
                .zoneWhich(get => get(context.state) ? "view" : undefined, {
                  view: counterView(aCounter)
                })
                .zoneWhich(get => get(context.state) ? "view" : undefined, {
                  view: counterView(bCounter)
                })
            })
          })
        })
      ],
      perform: [
        step("toggle the view", (context) => {
          context.writeTo(context.state, true)
        }),
        step("click the first button", async () => {
          await selectElements("button").at(0).click()
          await selectElements("button").at(0).click()
        }),
        step("click the second button", async () => {
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
          await selectElements("button").at(1).click()
        })
      ],
      observe: [
        effect("the events work as expected", async () => {
          await expect(selectElements("p").map(el => el.text()), resolvesTo([
            "Total: 2",
            "Total: 3",
          ]))
        })
      ]
    })

])