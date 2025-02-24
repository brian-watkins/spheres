import { batch, State, StoreMessage, update, use } from "@store/index.js";
import { HTMLBuilder, HTMLView } from "@view/index.js";
import { Item, items, suppliedTitle } from "./state";

export function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => {
        el.config.dataAttribute("title")
        el.children.subview(titleText)
      })
      .div(el => {
        el.config.id("item-form")
        el.children.subview(itemInput)
      })
      .hr()
      .ol(el => {
        el.children.subview(itemList)
      })
  })
}

export function titleText(root: HTMLBuilder) {
  root.textNode(get => get(suppliedTitle))
}

export function itemList(root: HTMLBuilder) {
  root.subviews(get => get(items), itemView)
}

export function itemInput(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .form(el => {
        el.config
          .style("display: flex; flex-direction: column; gap: 10px;")
          .on("submit", (evt) => { evt.preventDefault(); return submitForm(new FormData(evt.target as HTMLFormElement)); })
        el.children
          .subview(textField("item-name", "Name"))
          .subview(textField("item-color", "Color"))
          .div(el => {
            el.children
              .button(el => {
                el.children
                  .textNode("Save Item")
              })
          })
      })
  })
}

function submitForm(formData: FormData): StoreMessage<any> {
  const item: Item = {
    name: formData.get("item-name")?.valueOf() as string,
    color: formData.get("item-color")?.valueOf() as string
  }

  return batch([
    update(items, (list) => [item].concat(list))
  ])
}

function textField(name: string, label: string): HTMLView {
  return (root) => {
    root.label(el => {
      el.children
        .textNode(label)
        .input(el => {
          el.config
            .type("text")
            .name(name)
            .style("margin-left: 5px;")
        })
    })
  }
}

function itemView(item: State<Item>): HTMLView {
  return root => {
    root.li(el => {
      el.config
        .dataAttribute("item")
        .style("margin-bottom: 10px;")
      el.children
        .div(el => {
          el.config.style("display: flex; gap: 10px;")
          el.children
            .div(el => {
              el.config.dataAttribute("item-name")
              el.children.textNode(get => `${get(item).name}, ${get(item).color}`)
            })
            .button(el => {
              el.config
                .dataAttribute("delete-item", get => get(item).name)
                .on("click", () => use(get => {
                  return update(items, (current) => current.filter(i => i.name !== get(item).name))
                }))
              el.children.textNode("Delete Item")
            })
        })
    })
  }
}
