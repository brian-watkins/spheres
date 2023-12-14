import { createDisplay, htmlView } from "@src/index.js"
import { ViewController } from "best-behavior"

const viewController: ViewController<any> = {
  render: () => {
    const testAppMountPoint = document.createElement("div")
    testAppMountPoint.id = "test-display"
    document.body.appendChild(testAppMountPoint)

    const appDisplay = createDisplay()
    appDisplay.mount(testAppMountPoint, view())
  }
}

export default viewController

function view() {
  return htmlView()
    .div(div => {
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
}
