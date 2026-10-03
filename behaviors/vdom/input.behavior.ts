import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { container, Container } from "@store/index"
import { renderContext } from "./helpers/renderContext"
import { selectElement } from "./helpers/displayElement"

interface InputContext {
  inputValue: Container<string | undefined>
}

interface CheckboxContext {
  isChecked: Container<boolean | undefined>
}

export default behavior("input element", [
  example(renderContext<InputContext>())
    .description("reactive value set to undefined")
    .script({
      suppose: [
        fact("there is state for the input value", (app) => {
          app.setState({
            inputValue: container<string | undefined>({ initialValue: "Some initial value!" }),
          })
        }),
        fact("there is a view with an input whose value is reactive", (app) => {
          app.mountView((root) => {
            root.input((el) => {
              el.config.type("text").value((get) => get(app.state.inputValue))
            })
          })
        }),
      ],
      observe: [
        effect("the input has the initial value", async () => {
          await expect(selectElement("input").inputValue(), resolvesTo("Some initial value!"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the input value state is set to undefined", (app) => {
          app.writeTo(app.state.inputValue, undefined)
        }),
      ],
      observe: [
        effect("the input value is empty", async () => {
          await expect(selectElement("input").inputValue(), resolvesTo(""))
        }),
      ],
    }),

  example(renderContext<CheckboxContext>())
    .description("reactive checked set to undefined")
    .script({
      suppose: [
        fact("there is state for the checked value", (app) => {
          app.setState({
            isChecked: container<boolean | undefined>({ initialValue: true }),
          })
        }),
        fact("there is a view with a checkbox whose checked value is reactive", (app) => {
          app.mountView((root) => {
            root.input((el) => {
              el.config.type("checkbox").checked((get) => get(app.state.isChecked))
            })
          })
        }),
      ],
      observe: [
        effect("the checkbox is checked", async () => {
          await expect(selectElement("input").isChecked(), resolvesTo(true))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the checked state is set to undefined", (app) => {
          app.writeTo(app.state.isChecked, undefined)
        }),
      ],
      observe: [
        effect("the checkbox is not checked", async () => {
          await expect(selectElement("input").isChecked(), resolvesTo(false))
        }),
      ],
    }),
])
