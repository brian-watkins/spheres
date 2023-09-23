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
      el.children
        .h1(el => {
          el.children.text(`There are ${list.length} people!`)
        })
        .button(el => {
          el.config
            .dataAttribute("reorder")
            .on({ click: () => store(shiftPeopleSelection) })
          el.children
            .text("Reorder People")
        })
        .button(el => {
          el.config
            .dataAttribute("increment-ticker")
            .on({ click: () => store(incrementTicker) })
          el.children
            .text("Increment")
        })
        .hr()
        .ul(el => {
          for (const person of list) {
            switch (props.keyOnState) {
              case "stateful":
                el.children.withState({
                  key: person,
                  view: get => personViewWithoutKey(person, get)
                })
                break
              case "element":
                el.children.withView(personViewWithKey(person))
                break
              case "block":
                el.children.append({
                  view: () => personViewWithStatefulText(person),
                  key: person
                })
            }
          }
        })
    })
}

function personViewWithKey(person: State<Person>): View {
  return view()
    .li(el => {
      el.config
        .key(person)
      el.children
        .withState({
          view: get => {
            return view()
              .h1(el => {
                el.config.dataAttribute("person")
                el.children.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
              })
          }
        })
    })
}

function personViewWithoutKey(person: State<Person>, get: GetState): View {
  return view()
    .li(el => {
      el.children
        .h1(el => {
          el.config.dataAttribute("person")
          el.children.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

function personViewWithStatefulText(person: State<Person>): View {
  return view()
    .li(el => {
      el.children
        .h1(el => {
          el.config.dataAttribute("person")
          el.children.text((get) => `${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

export interface ReorderAppProps {
  keyOnState: "element" | "stateful" | "block"
}

export default function (props: ReorderAppProps): View {
  return view()
    .div(el => {
      el.config.id("reorder-list")
      el.children.withState({ view: peopleView(props) })
    })
}