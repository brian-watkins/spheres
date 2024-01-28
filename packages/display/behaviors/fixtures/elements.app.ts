import { htmlView } from "@src/index.js"

export default function view() {
  return htmlView(root => {
    root.div(div => {
      div.config
        .id("funny-id")
      div.children
        .p(p => {
          p.config
            .class("super-class")
            .dataAttribute("blah")
          p.children
            .textNode("This is text")
        })
        .h3(h3 => {
          h3.config
            .dataAttribute("title")
        })
        .div(el => {
          el.config
            .attribute("silly-attribute", "joke")
          el.children
            .textNode("This is silly!")
        })
        .input(el => {
          el.config
            .type("checkbox")
            .checked(true)
            .disabled(false)
        })
        .button(el => {
          el.config.aria("label", "submit")
        })
    })
  })
}
