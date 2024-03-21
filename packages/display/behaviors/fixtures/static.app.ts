import { container, GetState } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { htmlTemplate, HTMLView, WithProps } from "@src/index";

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

function nameView(get: GetState): HTMLView {
  return root => root.h2(el => {
    el.children.textNode(get(nameState))
  })
}

export function appWithSimpleState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zone(nameView)
  })
}

export function appWithNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zone(nestedAge)
  })
}

function nestedAge(get: GetState): HTMLView {
  const age = get(ageState)
  if (age < 100) {
    return root => root.zone(nameView)
  } else {
    return root => root.p(el => el.children.textNode("You are old!"))
  }
}


function firstLevelZone(get: GetState): HTMLView {
  return root => root.div(el => {
    el.children
      .zone(nameView)
      .p(el => el.children.textNode(`${get(ageState)} years!`))
  })
}

export function appWithDeeplyNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zone(firstLevelZone)
  })
}

const superZone = htmlTemplate(() => root => {
  root.div(({ children }) => {
    children
      .h1(({ children }) => {
        children.textNode("Hello!")
      })
  })
})

export function appWithBlock(root: HTMLBuilder) {
  root.zone(superZone())
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

export function appWithTemplates(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .zone(titleTemplate({ title: "One" }))
      .zone(titleTemplate({ title: "Two" }))
      .zone(titleTemplate({ title: "Three" }))
  })
}

interface TitleProps {
  title: string
}

const titleTemplate = htmlTemplate((withProps: WithProps<TitleProps>) => {
  return root => root.h1(el => {
    el.children.textNode(withProps((props) => props.title))
  })
})