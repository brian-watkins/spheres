import { htmlView, View } from "../../src/index.js";
import { container, GetState } from "@spheres/store";

interface StaticViewProps {
  name: string
  age: number
}

export function staticApp(props: StaticViewProps): View {
  return htmlView()
    .div(el => {
      el.children
        .h1(el => {
          el.children.textNode(`Hello "${props.name}"!`)
        })
        .hr()
        .p(el => {
          el.children.textNode(`You are supposedly ${props.age} years old.`)
        })
    })
}

export function appWithPropertiesAndAttributes(props: StaticViewProps): View {
  return htmlView()
    .div(el => {
      el.config.id("element-1")
      el.children
        .div(el => {
          el.config
            .class("my-class another-class")
            .dataAttribute("person", props.name)
          el.children.textNode(`${props.age} years old`)
        })
    })
}

export function appWithDataAttributesNoValue(props: StaticViewProps): View {
  return htmlView()
    .div(el => {
      el.children.div(el => {
        el.config.dataAttribute("is-person")
        el.children.textNode(`${props.age} years old`)
      })
    })
}

const nameState = container({ initialValue: "Cool Person!" })
const ageState = container({ initialValue: 98 })

function nameView(get: GetState): View {
  return htmlView()
    .h2(el => {
      el.children.textNode(get(nameState))
    })
}

export function appWithSimpleState(): View {
  return htmlView()
    .div(el => {
      el.children.zone(nameView)
    })
}

export function appWithNestedState(): View {
  return htmlView()
    .div(el => {
      el.children.zone(get => {
        const age = get(ageState)
        if (age < 100) {
          return htmlView()
            .zone(nameView)
        } else {
          return htmlView()
            .p(el => el.children.textNode("You are old!"))
        }
      })
    })
}

export function appWithDeeplyNestedState(): View {
  return htmlView()
    .div(el => {
      el.children.zone(get => {
        return htmlView()
          .div(el => {
            el.children
              .zone(nameView)
              .p(el => el.children.textNode(`${get(ageState)} years!`))
          })
      })
    })
}

export function appWithBlock(): View {
  return htmlView()
    .zone(() => {
      return htmlView().div(({ children }) => {
        children
          .h1(({ children }) => {
            children.textNode("Hello!")
          })
      })
    })
}

export function appWithReactiveText(): View {
  return htmlView()
    .div(el => {
      el.children.textNode((get) => `${get(ageState)} years old!`)
    })
}

export function appWithInnerHTML(): View {
  return htmlView()
    .div(el => {
      el.children
        .div(el => {
          el.config.innerHTML("<h1>HELLO!!!</h1>")
        })
    })
}