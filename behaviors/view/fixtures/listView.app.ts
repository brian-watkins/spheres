import { container, write } from "@spheres/store";
import { htmlTemplate } from "@src/htmlViewBuilder";
import { WithArgs } from "@src/index";

interface Fruit {
  name: string
}

const fruitState = container<Array<Fruit>, string>({
  initialValue: [
    { name: "apple" },
    { name: "grapes" },
    { name: "dragonfruit" }
  ],
  update(message, current) {
    if (message !== "shift") return { value: current }
    return { value: [ current[1], current[2], current[0] ] }
  },
})

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .button(el => {
        el.config
          .dataAttribute("shift-elements")
          .on("click", () => write(fruitState, "shift"))
        el.children
          .textNode("Click me to shift the fruit!")
      })
      .hr()
      .ul(el => {
        el.children
          .zones((get) => get(fruitState), fruitView)
      })
  })
})

const fruitView = htmlTemplate((withArgs: WithArgs<Fruit>) => root => {
  root.li(el => {
    el.children.textNode(withArgs(fruit => fruit.name))
  })
})