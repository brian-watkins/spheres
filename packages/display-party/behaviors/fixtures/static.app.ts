import { view, View } from "../../src/index.js";
import { container, GetState } from "state-party";

interface StaticViewProps {
  name: string
  age: number
}

export function staticApp(props: StaticViewProps): View {
  return view()
    .div(el => {
      el.children
        .h1(el => {
          el.children.text(`Hello "${props.name}"!`)
        })
        .hr()
        .p(el => {
          el.children.text(`You are supposedly ${props.age} years old.`)
        })
    })
}

export function appWithPropertiesAndAttributes(props: StaticViewProps): View {
  return view()
    .div(el => {
      el.config.id("element-1")
      el.children
        .div(el => {
          el.config
            .classes([
              "my-class",
              "another-class"
            ])
            .dataAttribute("person", props.name)
          el.children.text(`${props.age} years old`)
        })
    })
}

export function appWithDataAttributesNoValue(props: StaticViewProps): View {
  return view()
    .div(el => {
      el.children.div(el => {
        el.config.dataAttribute("is-person")
        el.children.text(`${props.age} years old`)
      })
    })
}

const nameState = container({ initialValue: "Cool Person!" })
const ageState = container({ initialValue: 98 })

function nameView(get: GetState): View {
  return view()
    .h2(el => {
      el.children.text(get(nameState))
    })
}

export function appWithSimpleState(): View {
  return view()
    .div(el => {
      el.children.view(nameView)
    })
}

export function appWithNestedState(): View {
  return view()
    .div(el => {
      el.children.view(get => {
        const age = get(ageState)
        if (age < 100) {
          return view()
            .view(nameView)
        } else {
          return view()
            .p(el => el.children.text("You are old!"))
        }
      })
    })
}

export function appWithDeeplyNestedState(): View {
  return view()
    .div(el => {
      el.children.view(get => {
        return view()
          .div(el => {
            el.children
              .view(nameView)
              .p(el => el.children.text(`${get(ageState)} years!`))
          })
      })
    })
}

export function appWithBlock(): View {
  return view()
    .view(() => {
      return view().div(({ children }) => {
        children
          .h1(({ children }) => {
            children.text("Hello!")
          })
      })
    })
}

export function appWithReactiveText(): View {
  return view()
    .div(el => {
      el.children.text((get) => `${get(ageState)} years old!`)
    })
}

export function appWithInnerHTML(): View {
  return view()
    .div(el => {
      el.children
        .div(el => {
          el.config.innerHTML("<h1>HELLO!!!</h1>")
        })
    })
}