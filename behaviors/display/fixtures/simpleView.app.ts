import * as View from "@src/display/index.js"
import { container, state, withDerivedValue, withInitialValue } from "@src/index.js"
import { writeMessage } from "@src/loop"

const peopleState = container(withInitialValue([
  { name: "Cool Dude", age: 41 },
  { name: "Awesome Person", age: 28 }
]))

const peopleView = state(withDerivedValue((get) => {
  const people = get(peopleState)
  return View.ul([], people.map(person => {
    return View.li([View.data("person")], [
      `${person.name} - ${person.age}`
    ])
  }))
}))

const localState = container(withInitialValue(""))

const updateButton = state(withDerivedValue(get => 
  View.button([
    View.onClick(writeMessage(peopleState, [{
      name: get(localState),
      age: 104
    }]))
  ], [ View.text("Click me!") ])
))

export default function(): View.View {
  return View.div([], [
    View.p([], [
      "Here is some person"
    ]),
    View.viewGenerator(peopleView),
    View.hr([], []),
    View.input([
      View.onInput(value => writeMessage(localState, value))
    ], []),
    View.viewGenerator(updateButton)
  ])
}