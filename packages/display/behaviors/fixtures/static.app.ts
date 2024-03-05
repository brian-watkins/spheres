import { container, GetState } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { HTMLView } from "@src/index";

interface StaticViewProps {
  name: string
  age: number
}

export function staticApp(props: StaticViewProps): HTMLView {
  return root =>
    root.div(el => {
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

export function appWithPropertiesAndAttributes(props: StaticViewProps): HTMLView {
  return root =>
    root.div(el => {
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

export function appWithDataAttributesNoValue(props: StaticViewProps): HTMLView {
  return root =>
    root.div(el => {
      el.children.div(el => {
        el.config.dataAttribute("is-person")
        el.children.textNode(`${props.age} years old`)
      })
    })
}

const nameState = container({ initialValue: "Cool Person!" })
const ageState = container({ initialValue: 98 })

function nameView(root: HTMLBuilder, get: GetState) {
  root.h2(el => {
    el.children.textNode(get(nameState))
  })
}

export function appWithSimpleState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zoneWithState(nameView)
  })
}

export function appWithNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zoneWithState(nestedAge)
  })
}

function nestedAge(root: HTMLBuilder, get: GetState) {
  const age = get(ageState)
  if (age < 100) {
    root.zoneWithState(nameView)
  } else {
    root.p(el => el.children.textNode("You are old!"))
  }
}


function firstLevelZone(root: HTMLBuilder, get: GetState) {
  root.div(el => {
    el.children
      .zoneWithState(nameView)
      .p(el => el.children.textNode(`${get(ageState)} years!`))
  })
}

export function appWithDeeplyNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zoneWithState(firstLevelZone)
  })
}

function superZone(root: HTMLBuilder) {
  root.div(({ children }) => {
    children
      .h1(({ children }) => {
        children.textNode("Hello!")
      })
  })
}

export function appWithBlock(root: HTMLBuilder) {
  root.zone(superZone)
}

export function appWithReactiveText(root: HTMLBuilder) {
  root.div(el => {
    el.children.textNode(get => `${get(ageState)} years old!`)
  })
}

export function appWithInnerHTML(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .div(el => {
        el.config.innerHTML("<h1>HELLO!!!</h1>")
      })
  })
}