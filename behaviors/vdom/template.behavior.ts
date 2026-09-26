import { behavior, effect, example, fact, step } from "best-behavior"
import { equalTo, expect, resolvesTo } from "great-expectations"
import { selectElement } from "./helpers/displayElement.js"
import { renderContext } from "./helpers/renderContext.js"
import { container, Container } from "@store/index.js"

interface TemplateContext {
  message: Container<string>
}

export default behavior("template element", [
  example(renderContext())
    .description("mount a template element")
    .script({
      suppose: [
        fact("there is a template element with children", (context) => {
          context.mountView((root) => {
            root.div((el) => {
              el.children.template((el) => {
                el.children.p((el) => el.children.textNode("In the shadows!"))
              })
            })
          })
        }),
      ],
      observe: [
        effect("the template is not added to the dom", async () => {
          await expect(selectElement("template").exists(), resolvesTo(false))
        }),
      ],
    }),

  example(renderContext<TemplateContext>())
    .description("activating a view with a template element")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            message: container({ initialValue: "Hello!" }),
          })
        }),
        fact("a view with a template element followed by stateful text is activated", (context) => {
          context.ssrAndActivate((root) => {
            root.div((el) => {
              el.children
                .template((el) => {
                  el.children.p((el) => el.children.textNode("In the shadows!"))
                })
                .p((el) => {
                  el.config.dataAttribute("message")
                  el.children.textNode((get) => get(context.state.message))
                })
            })
          })
        }),
      ],
      perform: [
        step("the state is updated", (context) => {
          context.writeTo(context.state.message, "Goodbye!")
        }),
      ],
      observe: [
        effect("the stateful text after the template is updated", async () => {
          await expect(selectElement("[data-message]").text(), resolvesTo(equalTo("Goodbye!")))
        }),
      ],
    }),
])
