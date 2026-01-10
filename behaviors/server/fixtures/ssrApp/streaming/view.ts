import { HTMLBuilder, HTMLView, UseData } from "@view/index";
import { someWord, Thing, thingCount, things, thingValue } from "./state";

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
      .h1(el => {
        el.config.dataAttribute("word")
        el.children.textNode(get => get(someWord))
      })
  })
}

function thingView(useData: UseData<Thing>): HTMLView {
  return root => {
    root.li(el => {
      el.children
        .h3(el => {
          el.children.textNode(useData((thing) => `A ${thing.name} that is ${thing.color}`))
        })
    })
  }
}