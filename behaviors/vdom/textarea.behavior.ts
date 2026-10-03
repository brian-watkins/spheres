import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { container, Container } from "@store/index"
import { renderContext } from "./helpers/renderContext"
import { selectElement } from "./helpers/displayElement"

interface TextareaContext {
  textValue: Container<string | undefined>
}

export default behavior("textarea element", [
  example(renderContext<TextareaContext>())
    .description("reactive value set to undefined")
    .script({
      suppose: [
        fact("there is state for the textarea value", (app) => {
          app.setState({
            textValue: container<string | undefined>({ initialValue: "Some initial content!" }),
          })
        }),
        fact("there is a view with a textarea whose value is reactive", (app) => {
          app.mountView((root) => {
            root.textarea((el) => {
              el.config.value((get) => get(app.state.textValue))
            })
          })
        }),
      ],
      observe: [
        effect("the textarea has the initial value", async () => {
          await expect(selectElement("textarea").inputValue(), resolvesTo("Some initial content!"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the textarea value state is set to undefined", (app) => {
          app.writeTo(app.state.textValue, undefined)
        }),
      ],
      observe: [
        effect("the textarea value is empty", async () => {
          await expect(selectElement("textarea").inputValue(), resolvesTo(""))
        }),
      ],
    }),
])
