import { GetState, State, container, rule, use, write } from "@spheres/store";
import { HTMLView, htmlTemplate } from "@src/index";

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

function peopleView(get: GetState): HTMLView {
  const list = get(people)

  return root =>
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
            el.children.zone(personViewWithoutKey(person), {
              key: person
            })
          }
        })
    })
}

function personViewWithoutKey(person: State<Person>): (get: GetState) => HTMLView {
  return (get) => root =>
    root.li(el => {
      el.children
        .h1(el => {
          el.config.dataAttribute("person")
          el.children.textNode(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
        })
    })
}

export default htmlTemplate(() => root => {
  root.div(el => {
    el.config.id("reorder-list")
    el.children.zone(peopleView)
  })
})