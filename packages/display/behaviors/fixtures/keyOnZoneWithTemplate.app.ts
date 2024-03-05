import { GetState, State, container, rule, use, write } from "@spheres/store";
import { HTMLBuilder, WithProps } from "@src/index";

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

function peopleView(root: HTMLBuilder, get: GetState) {
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
          el.children.zoneWithTemplate(personViewWithStatefultextNode, person, {
            key: person
          })
        }
      })
  })
}

function personViewWithStatefultextNode(root: HTMLBuilder, withProps: WithProps<State<Person>>) {
  root.li(el => {
    el.children
      .h1(el => {
        el.config.dataAttribute("person")
        el.children.textNode(withProps((props, get) => `${get(props).name} is ${get(props).age} years old: ${get(ticker)}`))
      })
  })
}

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.config.id("reorder-list")
    el.children.zoneWithState(peopleView)
  })
}