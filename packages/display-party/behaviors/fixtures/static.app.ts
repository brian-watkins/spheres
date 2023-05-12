import { container, GetState, withInitialValue } from "state-party";
import * as View from "../../src/index.js";

interface StaticViewProps {
  name: string
  age: number
}

export function staticApp(props: StaticViewProps): View.View {
  return View.div([], [
    View.h1([], [
      View.text(`Hello "${props.name}"!`)
    ]),
    View.hr([], []),
    View.p([], [
      View.text(`You are supposedly ${props.age} years old.`)
    ])
  ])
}

export function appWithPropertiesAndAttributes(props: StaticViewProps): View.View {
  return View.div([
    View.id(`element-1`)
  ], [
    View.div([
      View.cssClasses([ "my-class", "another-class" ]),
      View.data("person", props.name)
    ], [
      View.text(`${props.age} years old`)
    ])
  ])
}

export function appWithDataAttributesNoValue(props: StaticViewProps): View.View {
  return View.div([], [
    View.div([
      View.data("is-person")
    ], [
      View.text(`${props.age} years old`)
    ])
  ])
}

const nameState = container(withInitialValue("Cool Person!"))
const ageState = container(withInitialValue(98))

function nameView(get: GetState): View.View {
  return View.h2([], [View.text(get(nameState))])
}

export function appWithSimpleState(): View.View {
  return View.div([], [
    View.withState(nameView)
  ])
}

export function appWithNestedState(): View.View {
  return View.div([], [
    View.withState((get) => {
      const age = get(ageState)
      if (age < 100) {
        return View.withState(nameView)
      } else {
        return View.p([], [
          View.text("You are old!")
        ])
      }
    })
  ])
}

export function appWithDeeplyNestedState(): View.View {
  return View.div([], [
    View.withState((get) => {
      return View.div([], [
        View.withState(nameView),
        View.p([], [View.text(`${get(ageState)} years!`)])
      ])
    })
  ])
}

export function appWithInnerHTML(): View.View {
  return View.div([], [
    View.div([
      View.property("innerHTML", "<h1>HELLO!!!</h1>")
    ], [])
  ])
}