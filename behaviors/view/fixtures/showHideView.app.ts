import { container, update } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";

const showView = container({ initialValue: false })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .button(el => {
        el.config
          .on("click", () => update(showView, (val) => !val))
        el.children
          .textNode("Click to toggle the view!")
      })
      .hr()
      .zoneShow(get => get(showView), funView)
      .hr()
  })
}

function funView(root: HTMLBuilder) {
  root.p(el => {
    el.config.dataAttribute("toggleable-view")
    el.children.textNode("This is a view we can show and hide!")
  })
}