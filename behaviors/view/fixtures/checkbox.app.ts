import { container, reset, write } from "@spheres/store";
import { HTMLBuilder } from "@src/index";

const boxes = [
  "one",
  "two",
  "three",
  "four"
]

const checkedBoxes = container({ initialValue: ["three"] })

export default function (root: HTMLBuilder) {
  root.main(({ children }) => {
    children
      .form(({ config, children }) => {
        config
          .on("submit", (evt) => {
            evt.preventDefault()
            const form = evt.target as HTMLFormElement
            const list = (form.elements.namedItem("number-of-things") as RadioNodeList)

            let checkedNumbers = []
            for (const box of list) {
              const inputBox = box as HTMLInputElement
              if (inputBox.checked) {
                checkedNumbers.push(inputBox.value)
              }
            }

            return write(checkedBoxes, checkedNumbers)
          })
        for (const box of boxes) {
          children
            .label(({ config, children }) => {
              config.style("display: block;")
              children
                .input(({ config }) => {
                  config
                    .type("checkbox")
                    .name("number-of-things")
                    .value(box)
                    .checked(get => get(checkedBoxes).includes(box))
                })
                .textNode(box)
            })
        }
        children
          .button(({ config }) => {
            config
              .type("submit")
              .dataAttribute("submit-button")
            children.textNode("Submit!")
          })
          .button(({ config, children }) => {
            config
              .type("button")
              .dataAttribute("reset-button")
              .on("click", () => reset(checkedBoxes))
            children
              .textNode("Reset")
          })
      })
      .hr()
      .div(({ config, children }) => {
        config.dataAttribute("message")
        children.textNode(get => `You checked: ${get(checkedBoxes).join(", ")}`)
      })
  })
}