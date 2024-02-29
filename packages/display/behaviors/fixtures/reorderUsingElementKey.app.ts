import { GetState, State, container, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/index";

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

const shiftPeopleRule = rule(get => {
  const current = get(people)
  if (current.length === 0) {
    return write(people, current)
  }

  return write(people, [...current.slice(1), current[0]])
})

const incrementTicker = rule(get => {
  return write(ticker, get(ticker) + 1)
})

function peopleView(root: HTMLBuilder<ReorderAppProps>, get: GetState, props: ReorderAppProps) {
  const list = get(people)

  root.div(el => {
    el.children
      .h1(el => {
        el.children.textNode(`There are ${list.length} people!`)
      })
      .button(el => {
        el.config
          .dataAttribute("reorder")
          .on("click", () => use(shiftPeopleRule))
        el.children
          .textNode("Reorder People")
      })
      .button(el => {
        el.config
          .dataAttribute("increment-ticker")
          .on("click", () => use(incrementTicker))
        el.children
          .textNode("Increment")
      })
      .hr()
      .ul(el => {
        for (const person of list) {
          switch (props.keyOnState) {
            case "stateful":
              el.children.zone(personViewWithoutKey, {
                props: person,
                key: person
              })
              break
            case "block":
              el.children.zone(personViewWithStatefultextNode, {
                props: person,
                key: person
              })
          }
        }
      })
  })
}

function personViewWithoutKey(root: HTMLBuilder<State<Person>>, get: GetState, person: State<Person>) {
  root.li(el => {
    el.children
      .h1(el => {
        el.config.dataAttribute("person")
        el.children.textNode(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
      })
  })
}

function personViewWithStatefultextNode(root: HTMLBuilder<State<Person>>) {
  root.li(el => {
    el.children
      .h1(el => {
        el.config.dataAttribute("person")
        el.children.textNode($ => `${$.get($.props).name} is ${$.get($.props).age} years old: ${$.get(ticker)}`)
      })
  })
}

export interface ReorderAppProps {
  keyOnState: "stateful" | "block"
}

export default function (root: HTMLBuilder<ReorderAppProps>) {
  root.div(el => {
    el.config.id("reorder-list")
    el.children.zone(peopleView, { props })
  })
}