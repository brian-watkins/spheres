import { View, view } from "@src/index.js";
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

  return write(people, [ ...current.slice(1), current[0] ])
})

const incrementTicker = selection(get => {
  return write(ticker, get(ticker) + 1)
})

const peopleView = (props: ReorderAppProps) => (get: GetState) => {
  const list = get(people)

  return view()
    .div(el => {
      el.view
        .h1(el => {
          el.view.text(`There are ${list.length} people!`)
        })
        .button(el => {
          el.config
            .dataAttribute("reorder")
            .onClick(() => store(shiftPeopleSelection))
          el.view
            .text("Reorder People")
        })
        .button(el => {
          el.config
            .dataAttribute("increment-ticker")
            .onClick(() => store(incrementTicker))
          el.view
            .text("Increment")
        })
        .hr()
        .ul(el => {
          for (const person of list) {
            if (props.keyOnState) {
              el.view.withState({
                key: person,
                view: get => personViewWithoutKey(person, get)
              })
            } else {
              el.view.withView(personViewWithKey(person))
            }
          }
        })
    })
}

function personViewWithKey(person: State<Person>): View {
  return view()
    .li(el => {
      el.config.key(person)
      el.view
        .withState({
          view: get => {
            return view()
              .h1(el => {
                el.config.dataAttribute("person")
                el.view.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
              })
          }
        })
    })
}

function personViewWithoutKey(person: State<Person>, get: GetState): View {
  return view()
    .li(el => {
      el.view
        .h1(el => {
          el.config.dataAttribute("person")
          el.view.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

export interface ReorderAppProps {
  keyOnState: boolean
}

export default function (props: ReorderAppProps): View {
  return view()
    .div(el => {
      el.config.id("reorder-list")
      el.view.withState({ view: peopleView(props) })
    })
}