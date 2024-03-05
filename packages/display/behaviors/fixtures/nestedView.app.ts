import { container, GetState, write } from "@spheres/store"
import { HTMLBuilder } from "@src/index.js"
import { useValue } from "./helpers"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

function ageView(root: HTMLBuilder) {
  root.p(el => {
    el.config.dataAttribute("age")
    el.children.textNode(get => `My age is ${get(ageState)}`)
  })
}

function nameView(root: HTMLBuilder, get: GetState) {
  const name = get(nameState)

  root.div(el => {
    el.children.p(el => {
      el.config.dataAttribute("name")
      el.children.textNode(`My name is: ${name}`)
    })
    if (name !== "AGELESS PERSON") {
      el.children.zone(ageView)
    }
  })
}

export default function view(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is only a test!"))
      .zoneWithState(nameView)
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