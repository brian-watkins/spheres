import { View, htmlView } from "@src/index.js";
import { store, GetState, State, container, selection, write } from "state-party";

interface Person {
  name: string
  age: number
}

function person(name: string): Person {
  return {
    name,
    age: name.length
  }
}

const ticker = container({ initialValue: 1 })
const coolPerson = container({ initialValue: person("Cool Dude"), name: "cool" })
const awesomePerson = container({ initialValue: person("Fundamentally Awesome"), name: "awesome" })
const happyPerson = container({ initialValue: person("Happy Animal"), name: "happy" })

const people = container({
  initialValue: [
    coolPerson,
    awesomePerson,
    happyPerson
  ]
})

const shiftPeopleSelection = selection(get => {
  const current = get(people)
  if (current.length === 0) {
    return write(people, current)
  }

  return write(people, [...current.slice(1), current[0]])
})

const incrementTicker = selection(get => {
  return write(ticker, get(ticker) + 1)
})

const peopleView = (props: ReorderAppProps) => (get: GetState) => {
  const list = get(people)

  return htmlView()
    .div(el => {
      el.children
        .h1(el => {
          el.children.textNode(`There are ${list.length} people!`)
        })
        .button(el => {
          el.config
            .dataAttribute("reorder")
            .on("click", () => store(shiftPeopleSelection))
          el.children
            .textNode("Reorder People")
        })
        .button(el => {
          el.config
            .dataAttribute("increment-ticker")
            .on("click", () => store(incrementTicker))
          el.children
            .textNode("Increment")
        })
        .hr()
        .ul(el => {
          for (const person of list) {
            switch (props.keyOnState) {
              case "stateful":
                el.children.andThen(get => personViewWithoutKey(person, get), {
                  key: person
                })
                break
              case "block":
                el.children.andThen(() => personViewWithStatefultextNode(person), {
                  key: person
                })
            }
          }
        })
    })
}

function personViewWithoutKey(person: State<Person>, get: GetState): View {
  return htmlView()
    .li(el => {
      el.children
        .h1(el => {
          el.config.dataAttribute("person")
          el.children.textNode(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

function personViewWithStatefultextNode(person: State<Person>): View {
  return htmlView()
    .li(el => {
      el.children
        .h1(el => {
          el.config.dataAttribute("person")
          el.children.textNode((get) => `${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

export interface ReorderAppProps {
  keyOnState: "stateful" | "block"
}

export default function (props: ReorderAppProps): View {
  return htmlView()
    .div(el => {
      el.config.id("reorder-list")
      el.children.andThen(peopleView(props))
    })
}