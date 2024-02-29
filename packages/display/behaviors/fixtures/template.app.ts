import { Container, container, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/index";

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
      .zone(funZone, {
        props: { id: 1, name: "Cool dude", counter: container({ initialValue: 0 }) }
      })
      .zone(funZone, {
        props: { id: 2, name: "Awesome person", counter: container({ initialValue: 0 }) }
      })
      .zone(funZone, {
        props: { id: 3, name: "Fun human", counter: container({ initialValue: 0 }) }
      })
  })
}

function funZone(root: HTMLBuilder<Context>) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("greeting", (_, props) => `${props.id}`)
            el.children
              .textNode((get, props) => `${get(greeting)}, ${props.name}!`)
          })
          .div(el => {
            el.config
              .dataAttribute("counter", (_, props) => `${props.id}`)
            el.children
              .textNode((get, props) => `${get(props.counter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .button(el => {
            el.config
              .dataAttribute("increment-counter", (_, props) => `${props.id}`)
              .on("click", (_, props) => {
                return use(rule((get) => {
                  return write(props.counter, get(props.counter) + 1)
                }))
              })
            el.children
              .textNode("Click me!")
          })
      })
  })
}