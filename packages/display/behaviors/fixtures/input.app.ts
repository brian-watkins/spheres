import { htmlTemplate } from "@src/index.js"
import { container, write } from "@spheres/store"

export interface InputAppProps {
  defaultInputValue: string
}

const formInputValue = container({ initialValue: "" })

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .form(el => {
        el.config
          .on("submit", (evt) => {
            evt.preventDefault()
            const form = evt.target as HTMLFormElement
            const inputValue = (form.elements.namedItem("fun-stuff") as HTMLInputElement).value
            return write(formInputValue, inputValue)
          })
        el.children
          .input(el => {
            el.config
              .name("fun-stuff")
              .dataAttribute("with-default")
              .value("my default value")
              .disabled(false)
          })
          .input(el => {
            el.config
              .dataAttribute("disabled")
              .disabled(true)
          })
          .button(el => {
            el.config.type("submit")
            el.children.textNode("Submit!")
          })
      })
      .hr()
      .div(el => {
        el.config.dataAttribute("message")
        el.children.textNode(get => get(formInputValue))
      })
  })
})