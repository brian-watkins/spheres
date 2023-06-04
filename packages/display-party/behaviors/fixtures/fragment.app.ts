import { View, view } from "@src/index.js";

export default function(): View {
  return view()
    .h1(el => el.view.text("This is the title"))
    .hr()
    .article(el => {
      el.view
        .p(el => {
          el.config.dataAttribute("order", "first")
          el.view.text("And this is a paragraph of text.")
        })
        .p(el => {
          el.config.dataAttribute("order", "second")
          el.view.text("And this is another paragraph of text.")
        })
    })
    .footer(el => el.view.text("This is the footer"))
}