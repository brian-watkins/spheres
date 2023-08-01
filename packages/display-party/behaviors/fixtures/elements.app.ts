import { view } from "@src/index.js"

export default function () {
  return view()
    .div(div => {
      div.config
        .id("funny-id")
      div.children
        .p(p => {
          p.config
            .classes(["super-class"])
            .dataAttribute("blah")
          p.children
            .text("This is text")
        })
        .h3(h3 => {
          h3.config
            .dataAttribute("title")
        })
        .input(el => {
          el.config.type("checkbox")
          el.config.checked(true)
          el.config.disabled(false)
        })
        .button(el => {
          el.config.aria({ label: "submit" })
        })
    })
}
