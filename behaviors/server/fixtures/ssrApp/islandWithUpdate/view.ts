import { batch, container, use, write } from "@store/index.js";
import { HTMLBuilder, HTMLView, UseData } from "@view/index.js";
import { addItem, Item, items } from "./state";

const inputField = container({ initialValue: "provided by server" })

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

function itemView(useItem: UseData<Item>): HTMLView {
  return (root) => {
    root.li(el => {
      el.children.textNode(useItem((get, item) => get(item).name))
    })
  }
}

function useValue<T>(handler: (value: string) => T): (evt: Event) => T {
  return (evt) => handler((evt.target as HTMLInputElement).value)
}