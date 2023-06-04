import { view } from "@src/index.js"

export default function () {
  return view()
    .div(div => {
      div.config
        .id("funny-id")
      div.view
        .p(p => {
          p.config
            .classes(["super-class"])
            .dataAttribute("blah")
          p.view
            .text("This is text")
        })
        .h3(h3 => {
          h3.config
            .dataAttribute("title")
        })
        .input(el => {
          el.config.dataAttribute("focused")
          el.config.autofocus(true)
          el.config.disabled(false)
        })
        .button(el => {
          el.config.ariaLabel("submit")
        })
    })
}
