import { container, update } from "@store/index.js";
import { HTMLBuilder } from "@view/index";

const showFun = container({ initialValue: false })

const funCounter = container({ initialValue: 0 })
const happyCounter = container({ initialValue: 0 })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .button(el => {
        el.config
          .dataAttribute("toggle")
          .on("click", () => update(showFun, (val) => !val))
        el.children
          .textNode("Click to toggle the view!")
      })
      .hr()
      .subviewFrom(select => select.withConditions()
        .when(get => get(showFun), funView)
        .default(happyView)
      )
      .hr()
      .h3(el => {
        el.config.dataAttribute("total-fun")
        el.children.textNode(get => `Total fun clicks: ${get(funCounter)}`)
      })
      .h3(el => {
        el.config.dataAttribute("total-happy")
        el.children.textNode(get => `Total happy clicks: ${get(happyCounter)}`)
      })
  })
}

function funView(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("fun-view")
        el.children.textNode("This is a view we can show and hide!")
      })
      .button(el => {
        el.config
          .dataAttribute("fun-counter")
          .on("click", () => update(funCounter, (val) => val + 1))
        el.children.textNode("Count stuff!")
      })
  })
}

function happyView(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("happy-view")
        el.children.textNode("This is a happy view we can show and hide!")
      })
      .button(el => {
        el.config
          .dataAttribute("happy-counter")
          .on("click", () => update(happyCounter, (val) => val + 1))
        el.children.textNode("Count stuff!")
      })
  })
}
