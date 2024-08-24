import { container } from "@spheres/store";
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

function nameView(root: HTMLBuilder) {
  root.h2(el => {
    el.children.textNode(get => get(nameState))
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

function nestedAge(root: HTMLBuilder) {
  root.zoneShow(get => get(ageState) < 100, nameView)
}

// function nestedAge(get: GetState): HTMLView {
//   const age = get(ageState)
//   if (age < 100) {
//     return root => root.zone(nameView)
//   } else {
//     return root => root.p(el => el.children.textNode("You are old!"))
//   }
// }


function firstLevelZone(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .zone(nameView)
      .p(el => el.children.textNode(get => `${get(ageState)} years!`))
  })
}

export function appWithDeeplyNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.zone(firstLevelZone)
  })
}

// const superZone = htmlTemplate(() => root => {
//   root.div(({ children }) => {
//     children
//       .h1(({ children }) => {
//         children.textNode("Hello!")
//       })
//   })
// })

function superZone(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => {
        el.children.textNode("Hello!")
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

function titleTemplate(props: TitleProps): HTMLView {
  return root => {
    root.h1(el => {
      el.children.textNode(props.title)
    })
  }
}

// const titleTemplate = htmlTemplate((withArgs: WithArgs<TitleProps>) => {
//   return root => root.h1(el => {
//     el.children.textNode(withArgs((props) => props.title))
//   })
// })

export function appWithReactiveAttributes(root: HTMLBuilder) {
  root.div(el => {
    el.config
      .dataAttribute("name", (get) => get(nameState))
    el.children
      .textNode("This is your name!")
  })
}

export function appWithReactiveClass(root: HTMLBuilder) {
  root.div(el => {
    el.config
      .class((get) => `bg-red-${get(ageState)}`)
    el.children
      .textNode("Look at this!")
  })
}