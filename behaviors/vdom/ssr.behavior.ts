import { container, Container, State } from "@store/index.js";
import { HTMLView } from "@view/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { selectElements } from "./helpers/displayElement";
import { renderContext } from "./helpers/renderContext";

interface ListContext {
  options: Container<Array<string>>
  message: Container<string>
}

export default behavior("ssr", [

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
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo<Array<string | undefined>>([
            "hello", "hello", "hello"
          ]))
        }),
        effect("the default class property is activated on the client", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo<Array<string | undefined>>([
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
          await expect(selectElements("[data-stateful-text]").map(el => el.attribute("data-stateful-text")), resolvesTo<Array<string | undefined>>([
            "Yo", "Yo", "Yo"
          ]))
        }),
        effect("the class property updates", async () => {
          await expect(selectElements("[data-stateful-text]").map(el => el.property("className")), resolvesTo<Array<string | undefined>>([
            "text-Yo", "text-Yo", "text-Yo"
          ]))
        })
      ]
    })

])
