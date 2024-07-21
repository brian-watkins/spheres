import { container, State, update } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { HTMLView } from "@src/index";

// const funTemplate = htmlTemplate((withArgs: WithArgs<string>) => root => {
function funTemplate(name: State<string>): HTMLView {
  return root => {
    root.zoneShow(get => get(showLabels), (root) => {
      root.h3(el => {
        el.config.dataAttribute("toggleable-view")
        el.children.textNode(get => `You are ${get(name)}!`)
      })
    })
  }
}

const names = container<Array<string>>({ initialValue: ["cool", "awesome", "fun", "great"] })
const showLabels = container({ initialValue: true })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zones(get => get(names), funTemplate)
      .hr()
      .button(el => {
        el.config.on("click", () => update(showLabels, (val) => !val))
        el.children.textNode("Click to toggle!")
      })
  })
}