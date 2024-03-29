import { container, GetState, rule, use, write } from "@spheres/store"
import { useValue } from "./helpers"
import { htmlTemplate, HTMLView } from "@src/index"

const peopleState = container({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

function peopleView(get: GetState): HTMLView {
  const people = get(peopleState)

  return root =>
    root.ul(el => {
      for (const person of people) {
        el.children.li(el => {
          el.config.dataAttribute("person")
          el.children.textNode(`${person.name} - ${person.age}`)
        })
      }
    })
}

const localState = container({ initialValue: "" })

const writePeople = rule((get) => {
  return write(peopleState, [{
    name: get(localState),
    age: 104
  }])
})

const updateButton = htmlTemplate(() => root => {
  root.button(el => {
    el.config.on("click", () => use(writePeople))
    el.children.textNode("Click me!")
  })
})

export default htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .p(el => el.children.textNode("Here is some person"))
      .zone(peopleView)
      .hr()
      .input(el => {
        el.config.on("input", useValue((value) => write(localState, value)))
      })
      .zone(updateButton())
  })
})