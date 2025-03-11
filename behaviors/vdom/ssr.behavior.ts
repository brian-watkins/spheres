import { container, Container, State } from "@store/index.js";
import { HTMLView } from "@view/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { selectElement, selectElements } from "./helpers/displayElement";
import { renderContext } from "./helpers/renderContext";

interface ListContext {
  options: Container<Array<string>>
  message: Container<string>
}

interface BasicContext {
  message: Container<string>
}

export default behavior("ssr", [

  example(renderContext<BasicContext>())
    .description("activating ssr aria attribute")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Yo!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          context.ssrAndActivate(root => {
            root.div(el => {
              el.config
                .aria("label", get => get(context.state.message))
                .aria("disabled", "false")
              el.children.textNode("Hello!")
            })
          })
        })
      ],
      observe: [
        effect("the aria attributes are rendered", async () => {
          await expect(selectElement("div").attribute("aria-label"), resolvesTo("Yo!"))
          await expect(selectElement("div").attribute("aria-disabled"), resolvesTo("false"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", context => {
          context.writeTo(context.state.message, "Cool!")
        })
      ],
      observe: [
        effect("the reactive aria attribute updates", async () => {
          await expect(selectElement("div").attribute("aria-label"), resolvesTo("Cool!"))
        })
      ]
    }),

  example(renderContext<BasicContext>())
    .description("activating ssr inner html")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Nice!" })
          })
        }),
        fact("a view with aria attributes is activated", (context) => {
          context.ssrAndActivate(root => {
            root.main(el => {
              el.children
                .h2(el => {
                  el.config.innerHTML("<em>Awesome!</em>")
                })
                .div(el => {
                  el.config
                    .innerHTML(get => `<p>${get(context.state.message)}</p>`)
                })
            })
          })
        })
      ],
      observe: [
        effect("the inner html is rendered", async () => {
          await expect(selectElement("main h2 em").text(), resolvesTo("Awesome!"))
          await expect(selectElement("main div p").text(), resolvesTo("Nice!"))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", context => {
          context.writeTo(context.state.message, "Super!!")
        })
      ],
      observe: [
        effect("the reactive inner html updates", async () => {
          await expect(selectElement("main div p").text(), resolvesTo("Super!!"))
        })
      ]
    }),

  example(renderContext<ListContext>())
    .description("activating ssr list items with stateful text, attribute, property")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            options: container({ initialValue: ["a", "b", "c"] }),
            message: container({ initialValue: "hello" })
          })
        }),
        fact("there is a ssr list with stateful text", (context) => {
          function itemView(state: State<string>): HTMLView {
            return root => {
              root.p(el => {
                el.config
                  .dataAttribute("stateful-text", get => get(context.state.message))
                  .class(get => `text-${get(context.state.message)}`)
                el.children.textNode(get => `${get(context.state.message)} ${get(state)}`)
              })
            }
          }

          context.ssrAndActivate((root) => {
            root.div(el => [
              el.children
                .div(el => {
                  el.children.subviews(get => get(context.state.options), itemView)
                })
            ])
          })
        })
      ],
      observe: [
        effect("the default text is rendered on the server", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.text()), resolvesTo([
            "hello a", "hello b", "hello c"
          ]))
        }),
        effect("the default data attribute is rendered on the server", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo([
            "hello", "hello", "hello"
          ]))
        }),
        effect("the default class property is activated on the client", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo([
            "text-hello", "text-hello", "text-hello"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.message, "Yo")
        })
      ],
      observe: [
        effect("the stateful texts update", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.text()), resolvesTo([
            "Yo a", "Yo b", "Yo c"
          ]))
        }),
        effect("the data attribute updates", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo([
            "Yo", "Yo", "Yo"
          ]))
        }),
        effect("the class property updates", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo([
            "text-Yo", "text-Yo", "text-Yo"
          ]))
        })
      ]
    })

])
