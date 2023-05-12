import { container, GetState, rule, State, trigger, withInitialValue } from "state-party";
import * as View from "@src/index.js"

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

const ticker = container(withInitialValue(1))
const coolPerson = container(withInitialValue(person("Cool Dude")))
const awesomePerson = container(withInitialValue(person("Fundamentally Awesome")))
const happyPerson = container(withInitialValue(person("Happy Animal")))

const people = container(withInitialValue([
  coolPerson,
  awesomePerson,
  happyPerson
]))

const shiftPeopleRule = rule(people, ({current}) => {
  const first = current.shift()
  current.push(first!)

  return current
})

const incrementTicker = rule(ticker, ({current}) => {
  return current + 1
})

const peopleView = (get: GetState) => {
  const list = get(people)

  return View.div([], [
    View.h1([], [View.text(`There are ${list.length} people!`)]),
    View.button([
      View.data("reorder"),
      View.onClick(trigger(shiftPeopleRule))
    ], [View.text("Reorder People")]),
    View.button([
      View.data("increment-ticker"),
      View.onClick(trigger(incrementTicker))
    ], [View.text("Increment")]),
    View.hr([], []),
    View.ul([], list.map(personView))
  ])
}

function personView(person: State<Person>): View.View {
  return View.li([
    View.key(person)
  ], [
    View.withState(get => (
      View.h1([View.data("person")], [
        View.text(`${get(person).name} is ${get(person).age} years old: ${get(ticker)}`)
      ])
    ))
  ])
}

export default function (): View.View {
  return View.div([
    View.id("reorder-list")
  ], [
    View.withState(peopleView)
  ])
}