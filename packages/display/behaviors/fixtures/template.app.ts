import { Container, State, container, derived, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/index";
import { WithProps } from "@src/vdom/virtualNode";

const greeting = container({
  initialValue: "Hello"
})

interface Context {
  id: number
  name: string
  counter: Container<number>
}

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, derived({ query: () => ({
        id: 1, name: "Cool dude", counter: container({ initialValue: 0 })
      }) }))
      .zoneWithTemplate(funZone, derived({ query: () => ({
        id: 2, name: "Awesome person", counter: container({ initialValue: 0 })
      }) }))
      .zoneWithTemplate(funZone, derived({ query: () => ({
        id: 3, name: "Fun human", counter: container({ initialValue: 0 })
      }) }))

      // .zoneWithTemplate(funZone, {
      //   id: 2, name: "Awesome person", counter: container({ initialValue: 0 })
      // })
      // .zoneWithTemplate(funZone, {
      //   id: 3, name: "Fun human", counter: container({ initialValue: 0 })
      // })
    })
}

function funZone(root: HTMLBuilder, state: State<Context>) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("greeting", (get) => `${get(state).id}`)
            el.children
              .textNode((get) => `${get(greeting)}, ${get(state).name}!`)
          })
          .div(el => {
            el.config
              .dataAttribute("counter", (get) => `${get(state).id}`)
            el.children
              .textNode((get) => `${get(get(state).counter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .button(el => {
            el.config
              .dataAttribute("increment-counter", (get) => `${get(state).id}`)
              .on("click", () => {
                return use(rule((get) => {
                  return write(get(state).counter, get(get(state).counter) + 1)
                }))
              })
            el.children
              .textNode("Click me!")
          })
      })
  })
}