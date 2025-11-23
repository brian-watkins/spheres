import { container, update, use, write } from "@store/index.js";
import { HTMLBuilder, HTMLView, UseData } from "@view/index.js";

function funTemplate(useItem: UseData<string>): HTMLView {
  return root => {
    root.subviewFrom(select => select.withConditions().when(get => get(showLabels), root => {
      root.div(el => {
        el.children
          .h3(el => {
            el.config.dataAttribute("toggleable-view")
            el.children.textNode(useItem((get, item) => `You are ${get(item)}!`))
          })
          .button(el => {
            el.config
              .dataAttribute("delete-button", useItem((get, item) => get(item)))
              .on("click", () => use(useItem((get, item) => {
                return write(names, get(names).filter(n => n !== get(item)))
              })))
            el.children.textNode("Delete")
          })
      })
    }))
  }
}

const names = container<Array<string>>({ initialValue: ["cool", "awesome", "fun", "great"] })
const showLabels = container({ initialValue: true })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .subviews(get => get(names), funTemplate)
      .hr()
      .button(el => {
        el.config
          .dataAttribute("toggle-button")
          .on("click", () => update(showLabels, (val) => !val))
        el.children.textNode("Click to toggle!")
      })
  })
}
