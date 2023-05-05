import * as View from "@src/display/index.js"
import { container, GetState, withInitialValue, write } from "@src/store/index.js"

const peopleState = container(withInitialValue([
  { name: "Cool Dude", age: 41 },
  { name: "Awesome Person", age: 28 }
]))

const peopleView = (get: GetState) => {
  const people = get(peopleState)
  return View.ul([], people.map(person => {
    return View.li([View.data("person")], [
      View.text(`${person.name} - ${person.age}`)
    ])
  }))
}

const localState = container(withInitialValue(""))

const updateButton = (get: GetState) => 
  View.button([
    View.onClick(write(peopleState, [{
      name: get(localState),
      age: 104
    }]))
  ], [ View.text("Click me!") ])


export default function(): View.View {
  return View.div([], [
    View.p([], [
      View.text("Here is some person")
    ]),
    View.withState(peopleView),
    View.hr([], []),
    View.input([
      View.onInput(value => write(localState, value))
    ], []),
    View.withState(updateButton)
  ])
}