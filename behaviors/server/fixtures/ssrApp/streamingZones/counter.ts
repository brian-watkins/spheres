import { container, update } from "spheres/store";
import { HTMLBuilder } from "spheres/view";

export const count = container({ initialValue: 0 })

export function counter(root: HTMLBuilder) {
  root.subviewFrom(selector => {
    selector.withUnion(get => get(count.meta))
      .when(meta => meta.type === "pending", () => pendingCounter)
      .when(meta => meta.type === "error", () => errorCounter)
      .default(() => root => root.div(el => {
        el.children
          .h3(el => {
            el.children.textNode(get => `The count is ${get(count)}`)
          })
          .button(el => {
            el.config.on("click", () => update(count, (current) => current + 1))
            el.children.textNode("Increment")
          })
      }))
  })
}

function pendingCounter(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h3(el => {
        el.children.textNode("The counter is loading!")
      })
  })
}

function errorCounter(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h3(el => {
        el.children.textNode("Oops there was an error!")
      })
  })
}