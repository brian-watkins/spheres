import { batch, container } from "@store/index"
import { HTMLBuilder, HTMLView, UseData, svg } from "@view/index"

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
    el.children.subview(nameView)
  })
}

export function appWithNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.subview(nestedAge)
  })
}

function nestedAge(root: HTMLBuilder) {
  root.subviewFrom(select => select.withConditions().when(get => get(ageState) < 100, nameView))
}

function firstLevelZone(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .subview(nameView)
      .p(el => el.children.textNode(get => `${get(ageState)} years!`))
  })
}

export function appWithDeeplyNestedState(root: HTMLBuilder) {
  root.div(el => {
    el.children.subview(firstLevelZone)
  })
}

function superZone(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => {
        el.children.textNode("Hello!")
      })
  })
}

export function appWithZone(root: HTMLBuilder) {
  root.subview(superZone)
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

export function appWithEvents(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .div(el => {
        el.children
          .div(el => {
            el.config
              .on("click", () => batch([]))
              .on("focus", () => batch([]))
            el.children
              .textNode("Element with events!")
          })
      })
  })
}

const things = container({ initialValue: ["snake", "eagle"] })

export function appWithZones(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .subviews(get => get(things), thingView)
  })
}

function thingView(useThing: UseData<string>): HTMLView {
  return root => {
    root.div(el => {
      el.children
        .h1(el => el.children.textNode(useThing((thing, get, index) => `${thing} is at index ${get(index)}`)))
        .button(el => {
          el.config
            .on("click", () => batch([]))
            .on("focus", () => batch([]))
          el.children.textNode("Click me!")
        })
    })
  }
}

type Selector = "awesome" | "fun" | "cool"
const selectors = container<Selector>({ initialValue: "fun" })

export function appWithViewSelector(root: HTMLBuilder) {
  root.div(el => {
    el.children.subviewFrom(select => select.withConditions()
      .when(get => get(selectors) === "awesome", root => root.h1(el => el.children.textNode("Awesome!")))
      .when(get => get(selectors) === "fun", root => root.h3(el => el.children.textNode("Fun!")))
      .when(get => get(selectors) === "cool", root => root.h2(el => el.children.textNode("Cool!")))
    )
  })
}

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

export function simpleSVGView(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h1(el => el.children.textNode("Circles!"))
      .subview(svg(el => {
        el.config
          .width("300")
          .height("200")
          .class("some-fun-drawing")

        el.children
          .rect(({ config }) => [
            config
              .width("100%")
              .height("100%")
              .fill("red")
          ])
          .circle(({ config }) => {
            config
              .cx("150")
              .cy("100")
              .r("80")
              .fill("green")
              .fillOpacity("0.7")
          })
      }))
  })
}