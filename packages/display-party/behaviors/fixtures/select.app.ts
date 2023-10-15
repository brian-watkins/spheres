import { View, htmlView } from "@src/index";
import { container, write } from "state-party";

const fruits = [
  "apple",
  "pear",
  "banana",
  "grapes",
  "tomato",
  "blueberry"
]

const selectedFruit = container({ initialValue: "grapes" })

export default function (): View {
  return htmlView()
    .main(({ children }) => {
      children
        .form(({ children }) => {
          children
            .select(({ config, children }) => {
              config
                .on("change", (evt) => {
                  const selectElement = (evt.target as HTMLSelectElement)
                  const value = (selectElement[selectElement.selectedIndex] as HTMLOptionElement).value
                  return write(selectedFruit, value)
                })
              for (const fruit of fruits) {
                children
                  .option(({ config, children }) => {
                    config
                      .value(fruit)
                      .selected((get) => fruit === get(selectedFruit))
                    children
                      .textNode(fruit)
                  })
              }
            })
            .button(({ config, children }) => {
              config
                .type("button")
                .dataAttribute("reset-button")
                .on("click", () => write(selectedFruit, "grapes"))
              children
                .textNode("Reset")
            })
        })
        .hr()
        .div(({ config, children }) => {
          config.dataAttribute("message")
          children.textNode((get) => `Selected Option: ${get(selectedFruit)}`)
        })
    })
}