import { htmlView } from "@src/index.js"
import { container, rule, use, write } from "@spheres/store"

const clickCount = container({ initialValue: 0 })

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

export default function () {
  return htmlView(root => {
    root.div(div => {
      div.children
        .h1(h1 => h1.children.textNode("This is the click counter!"))
        .div(div => {
          div.children
            .button(b => {
              b.config.on("click", () => use(incrementCount))
              b.children.textNode("Click me!")
            })
            .p(p => {
              p.config.dataAttribute("click-count")
              p.children.textNode((get) => `You've clicked the button ${get(clickCount)} times!`)
            })
        })
    })
  })
}

