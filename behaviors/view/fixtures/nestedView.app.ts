import { container, write } from "@store/index.js"
import { HTMLBuilder } from "@view/index.js"
import { useValue } from "./helpers"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

function ageView (root: HTMLBuilder) {
  root.p(el => {
    el.config.dataAttribute("age")
    el.children.textNode(get => `My age is ${get(ageState)}`)
  })
}

function nameView(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("name")
        el.children.textNode(get => `My name is: ${get(nameState)}`)
      })
      .subviewFrom(select => select.withConditions()
        .when(get => get(nameState) !== "AGELESS PERSON", ageView)
      )
  })
}

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is only a test!"))
      .subview(nameView)
      .hr()
      .input(({ config }) => {
        config
          .dataAttribute("name-input")
          .on("input", useValue((value) => write(nameState, value)))
      })
      .input(({ config }) => {
        config
          .dataAttribute("age-input")
          .on("input", useValue((value) => write(ageState, Number(value))))
      })
  })
}
