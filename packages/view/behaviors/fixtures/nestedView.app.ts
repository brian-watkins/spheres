import { container, GetState, write } from "@spheres/store"
import { htmlTemplate, HTMLView } from "@src/index.js"
import { useValue } from "./helpers"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

const ageView = htmlTemplate(() => root => {
  root.p(el => {
    el.config.dataAttribute("age")
    el.children.textNode(get => `My age is ${get(ageState)}`)
  })
})

function nameView(get: GetState): HTMLView {
  const name = get(nameState)

  return root =>
    root.div(el => {
      el.children.p(el => {
        el.config.dataAttribute("name")
        el.children.textNode(`My name is: ${name}`)
      })
      if (name !== "AGELESS PERSON") {
        el.children.zone(ageView())
      }
    })
}

export default htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is only a test!"))
      .zone(nameView)
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
})