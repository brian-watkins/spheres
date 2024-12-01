import { batch, container, State, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { addItem, Item, items } from "./state";
import { HTMLView } from "@src/htmlViewBuilder";
import { useValue } from "fixtures/helpers";

const inputField = container({ initialValue: "" })

export function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => el.children.textNode("List of stuff!"))
      .hr()
      .ul(el => {
        el.children.subviews(get => get(items), itemView)
      })
      .hr()
      .div(el => {
        el.children
          .input(el => {
            el.config
              .type("text")
              .dataAttribute("item-input")
              .value(get => get(inputField))
              .on("input", useValue(value => write(inputField, value)))
          })
          .button(el => {
            el.config
              .dataAttribute("item-submit")
              .on("click", () => batch([
                use(get => write(items, addItem({ name: get(inputField) }))),
                write(inputField, "")
              ]))
            el.children.textNode("Add Item")
          })
      })
  })
}

function itemView(item: State<Item>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(get => get(item).name)
    })
  }
}