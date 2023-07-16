import { View, view } from "@src/index.js";
import { GetState, container } from "state-party";

// the thought is maybe I could specify a template
// for a stateful view at least, which would get used
// as the initial vnode

// So I need to add a template somwhere
// Then I need a list of stateful views.

let initialContents: Array<string> = []
for (let i = 0; i < 100; i++) {
  initialContents.push(`Hello ${i}!!!`)
}

const itemContents = container({
  initialValue: initialContents
})

const itemView = (index: number) => (get: GetState): View => {
  const contents = get(itemContents)

  return view()
    .li(el => {
      el.config.dataAttribute("item-row")
      el.view.text(contents[index])
    })
}

export default function (): View {
  return view()
    // .template(el => {
    //   el.config.id("item-template")
    //   el.view
    //     .li(el => {
    //       el.config.dataAttribute("item-row")
    //       el.view.text("hello template!!")
    //     })
    // })
    .div(el => {
      el.view.ul(el => {
        for (let i = 0; i < 100; i++) {
          el.view.withState({
            view: itemView(i),
            template: "item-template"
          })
        }
      })
    })
}