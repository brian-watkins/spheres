import { HTMLBuilder, HTMLView } from "@view/index";
import { Thing, thingCount, things, thingValue } from "./state";
import { State } from "@store/index";

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => {
        el.config.dataAttribute("title")
        el.children
          .subviewFrom(selector => {
            selector.withConditions()
              .when(get => get(things.meta).type === "pending", (root) => {
                root.textNode("Loading things ...")
              })
              .default(root => root.textNode(get => `Behold, the ${get(thingCount)} things!`))
          })
      })
      .ul(el => {
        el.children.subviews(get => get(things), thingView)
      })
      .h1(el => {
        el.config.dataAttribute("value")
        el.children
          .subviewFrom(selector => {
            selector.withConditions()
              .when(get => get(thingValue.meta).type === "pending", (root) => {
                root.textNode("Loading value ...")
              })
              .default(root => {
                root.textNode(get => `With a total value of ${get(thingValue)} dollars!`)
              })
          })
      })
  })
}

function thingView(thing: State<Thing>): HTMLView {
  return root => {
    root.li(el => {
      el.children
        .h3(el => {
          el.children.textNode(get => `A ${get(thing).name} that is ${get(thing).color}`)
        })
    })
  }
}