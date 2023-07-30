import { View, inputValue, view } from "@src/index.js"
import { container, GetState, selection, store, write } from "state-party"

const peopleState = container({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

const peopleView = (get: GetState) => {
  const people = get(peopleState)
  return view()
    .ul(el => {
      for (const person of people) {
        el.children.li(el => {
          el.config.dataAttribute("person")
          el.children.text(`${person.name} - ${person.age}`)
        })
      }
    })
}

const localState = container({ initialValue: "" })

const writePeople = selection((get) => {
  return write(peopleState, [{
    name: get(localState),
    age: 104
  }])
})

function updateButton(): View {
  return view()
    .button(el => {
      el.config.on({
        click: () => store(writePeople)
      })
      el.children.text("Click me!")
    })
}

export default function (): View {
  return view()
    .div(el => {
      el.children
        .p(el => el.children.text("Here is some person"))
        .withState({ view: peopleView })
        .hr()
        .input(el => el.config.on({
          input: event => write(localState, inputValue(event))
        }))
        .withView(updateButton())
    })
}