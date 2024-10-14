import { container, State, update, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { HTMLView } from "@src/index";

function funTemplate(name: State<string>): HTMLView {
  return root => {
    root.zoneWhich(get => get(showLabels) ? "view" : undefined, {
      view: (root) => {
        root.div(el => {
          el.children
            .h3(el => {
              el.config.dataAttribute("toggleable-view")
              el.children.textNode(get => `You are ${get(name)}!`)
            })
            .button(el => {
              el.config
                .dataAttribute("delete-button", get => get(name))
                .on("click", () => use(get => {
                  console.log("Filtering out", get(name))
                  return write(names, get(names).filter(n => n !== get(name)))
                }))
              el.children.textNode("Delete")
            })
        })
      }
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
        el.config
          .dataAttribute("toggle-button")
          .on("click", () => update(showLabels, (val) => !val))
        el.children.textNode("Click to toggle!")
      })
  })
}