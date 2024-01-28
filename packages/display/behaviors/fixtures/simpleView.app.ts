import { View, htmlView } from "@src/index.js"
import { container, GetState, rule, use, write } from "@spheres/store"
import { useValue } from "./helpers"

const peopleState = container({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

const peopleView = (get: GetState) => {
  const people = get(peopleState)
  return htmlView(root => {
    root.ul(el => {
      for (const person of people) {
        el.children.li(el => {
          el.config.dataAttribute("person")
          el.children.textNode(`${person.name} - ${person.age}`)
        })
      }
    })
  })
}

const localState = container({ initialValue: "" })

const writePeople = rule((get) => {
  return write(peopleState, [{
    name: get(localState),
    age: 104
  }])
})

function updateButton(): View {
  return htmlView(root => {
    root.button(el => {
      el.config.on("click", () => use(writePeople))
      el.children.textNode("Click me!")
    })
  })
}

export default function (): View {
  return htmlView(root => {
    root.div(el => {
      el.children
        .p(el => el.children.textNode("Here is some person"))
        .zone(peopleView)
        .hr()
        .input(el => {
          el.config.on("input", useValue((value) => write(localState, value)))
        })
        .zone(updateButton)
    })
  })
}