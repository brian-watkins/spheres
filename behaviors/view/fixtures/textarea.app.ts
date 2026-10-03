import { HTMLBuilder } from "@view/index.js"

export default function (root: HTMLBuilder) {
  root.main((el) => {
    el.children.textarea((el) => {
      el.config.value("Some static content!")
    })
  })
}
