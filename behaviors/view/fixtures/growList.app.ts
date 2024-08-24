import { HTMLBuilder } from "@src/htmlElements";
import { useValue } from "./helpers";
import { batch, container, reset, rule, State, use, write } from "@spheres/store";
import { HTMLView } from "@src/htmlViewBuilder";

const items = container<Array<string>, string>({
  initialValue: [ "fun" ],
  update(message, current) {
    return {
      value: [ message, ...current ]
    }
  },
})

const currentItem = container({ initialValue: "" })

export default function(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .input(el => {
        el.config
          .type("text")
          .name("item-input")
          .value(get => get(currentItem))
          .on("input", useValue((val => write(currentItem, val))))
      })
      .button(el => {
        el.config
          .on("click", () => use(rule(get => {
            return batch([
              write(items, get(currentItem)),
              reset(currentItem)
            ])
          })))
        el.children.textNode("Click to add!")
      })
      .hr()
      .ul(el => {
        el.children.zones(get => get(items), itemView)
      })
  })
}

function itemView(item: State<string>, index: State<number>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(get => `${get(item)} at index ${get(index)}`)
    })
  }
}