import { container, GetState, State, use, write } from "@store/index.js"
import { useValue } from "./helpers"
import { HTMLBuilder, HTMLView } from "@view/index.js"

interface Person {
  name: string
  age: number
}

const peopleState = container<Array<Person>>({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

function peopleView(root: HTMLBuilder) {
  root.ul(el => {
    el.children.subviews(get => get(peopleState), personView)
  })
}

function personView(person: State<Person>): HTMLView {
  return root => {
    root.li(el => {
      el.config.dataAttribute("person")
      el.children.textNode(get => `${get(person).name} - ${get(person).age}`)
    })
  }
}

const localState = container({ initialValue: "" })

const writePeople = (get: GetState) => {
  return write(peopleState, [{
    name: get(localState),
    age: 104
  }])
}

function updateButton(root: HTMLBuilder) {
  root.button(el => {
    el.config.on("click", () => use(writePeople))
    el.children.textNode("Click me!")
  })
}

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .p(el => el.children.textNode("Here is some person"))
      .subview(peopleView)
      .hr()
      .input(el => {
        el.config.on("input", useValue((value) => write(localState, value)))
      })
      .subview(updateButton)
  })
}
