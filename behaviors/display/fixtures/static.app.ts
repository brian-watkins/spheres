import * as View from "../../../src/display/index.js";

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