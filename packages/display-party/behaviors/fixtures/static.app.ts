import { view, View } from "../../src/index.js";
import { container, GetState } from "state-party";

interface StaticViewProps {
  name: string
  age: number
}

export function staticApp(props: StaticViewProps): View {
  return view()
    .h1(el => {
      el.view.text(`Hello "${props.name}"!`)
    })
    .hr()
    .p(el => {
      el.view.text(`You are supposedly ${props.age} years old.`)
    })
}

export function appWithPropertiesAndAttributes(props: StaticViewProps): View {
  return view()
    .div(el => {
      el.config.id("element-1")
      el.view
        .div(el => {
          el.config
            .dataAttribute("person", props.name)
            .classes([
              "my-class",
              "another-class"
            ])
          el.view.text(`${props.age} years old`)
        })
    })
}

export function appWithDataAttributesNoValue(props: StaticViewProps): View {
  return view()
    .div(el => {
      el.view.div(el => {
        el.config.dataAttribute("is-person")
        el.view.text(`${props.age} years old`)
      })
    })
}

const nameState = container({ initialValue: "Cool Person!" })
const ageState = container({ initialValue: 98 })

function nameView(get: GetState): View {
  return view()
    .h2(el => {
      el.view.text(get(nameState))
    })
}

export function appWithSimpleState(): View {
  return view()
    .div(el => {
      el.view.withState(nameView)
    })
}

export function appWithNestedState(): View {
  return view()
    .div(el => {
      el.view.withState(get => {
        const age = get(ageState)
        if (age < 100) {
          return view()
            .withState(nameView)
        } else {
          return view()
            .p(el => el.view.text("You are old!"))
        }
      })
    })
}

export function appWithDeeplyNestedState(): View {
  return view()
    .div(el => {
      el.view.withState(get => {
        return view()
          .div(el => {
            el.view
              .withState(nameView)
              .p(el => el.view.text(`${get(ageState)} years!`))
          })
      })
    })
}

export function appWithInnerHTML(): View {
  return view()
    .div(el => {
      el.view
        .div(el => {
          el.config.property("innerHTML", "<h1>HELLO!!!</h1>")
        })
    })
}