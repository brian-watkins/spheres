import * as View from "@src/index.js"
import { inputValue } from "@src/index.js"
import { container, GetState, selection, store, write } from "state-party"

const peopleState = container({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

const peopleView = (get: GetState) => {
  const people = get(peopleState)
  return View.ul([], people.map(person => {
    return View.li([View.data("person")], [
      View.text(`${person.name} - ${person.age}`)
    ])
  }))
}

const localState = container({ initialValue: "" })

const writePeople = selection(peopleState, ({ get }) => {
  return [{
    name: get(localState),
    age: 104
  }]
})

function updateButton() {
  return View.button([
    View.onClick(() => store(writePeople))
  ], [View.text("Click me!")])
}

export default function (): View.View {
  return View.div([], [
    View.p([], [
      View.text("Here is some person")
    ]),
    View.withState(peopleView),
    View.hr([], []),
    View.input([
      View.onInput(event => write(localState, inputValue(event)))
    ], []),
    updateButton()
  ])
}