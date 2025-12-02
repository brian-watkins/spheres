import { container, write } from "@store/index.js";
import { HTMLBuilder, HTMLView, UseData } from "@view/index.js";

interface Fruit {
  name: string
}

type FruitMessage = "shift" | "swap"

const fruitState = container<Array<Fruit>, FruitMessage>({
  initialValue: [
    { name: "apple" },
    { name: "grapes" },
    { name: "dragonfruit" }
  ],
  update(message, current) {
    switch (message) {
      case "shift":
        return { value: [ current[1], current[2], current[0] ] }
      case "swap":
        return { value: [ current[0], current[2], current[1] ] }
    }
  },
})

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .button(el => {
        el.config
          .dataAttribute("shift-elements")
          .on("click", () => write(fruitState, "shift"))
        el.children
          .textNode("Click me to shift the fruit!")
      })
      .button(el => {
        el.config
          .dataAttribute("swap-elements")
          .on("click", () => write(fruitState, "swap"))
        el.children
          .textNode("Click me to swap the fruit!")
      })
      .hr()
      .ul(el => {
        el.children
          .subviews((get) => get(fruitState), fruitView)
      })
  })
}

function fruitView(useFruit: UseData<Fruit>): HTMLView {
  return root => {
    root.li(el => {
      el.children.textNode(useFruit((item, get, index) => `${item.name} is at index ${get(index)}`))
    })
  }
}
