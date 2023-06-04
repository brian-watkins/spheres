import { View, view } from "@src/index.js";
import { selection, container, store, GetState, State } from "state-party";

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
const coolPerson = container({ initialValue: person("Cool Dude") })
const awesomePerson = container({ initialValue: person("Fundamentally Awesome") })
const happyPerson = container({ initialValue: person("Happy Animal") })

const people = container({
  initialValue: [
    coolPerson,
    awesomePerson,
    happyPerson
  ]
})

const shiftPeopleSelection = selection(people, ({ current }) => {
  const first = current.shift()
  if (!first) {
    return current
  }
  return [ ...current, first ]
})

const incrementTicker = selection(ticker, ({ current }) => {
  return current + 1
})

const peopleView = (get: GetState) => {
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
            el.view.withView(personView(person))
          }
        })
    })
}

function personView(person: State<Person>): View {
  return view()
    .li(el => {
      el.config.key(person)
      el.view
        .withState(get => {
          return view()
            .h1(el => {
              el.config.dataAttribute("person")
              el.view.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
            })
        })
    })
}

export default function (): View {
  return view()
    .div(el => {
      el.config.id("reorder-list")
      el.view.withState(peopleView)
    })
}