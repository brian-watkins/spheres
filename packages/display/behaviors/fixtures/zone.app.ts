import { Container, container, rule, use, write } from "@spheres/store";
import { View, htmlTemplate, htmlView } from "@src/index";

const greeting = container({
  initialValue: "Hello"
})

interface Context {
  id: number
  name: string
  counter: Container<number>
}

export default function (): View {
  return htmlView(root => {
    root.main(el => {
      el.children
        .zone(funZone({ id: 1, name: "Cool dude", counter: container({ initialValue: 0 }) }))
        .zone(funZone({ id: 2, name: "Awesome person", counter: container({ initialValue: 0 }) }))
        .zone(funZone({ id: 3, name: "Fun human", counter: container({ initialValue: 0 }) }))
    })
  })
}

const funZone = htmlTemplate<Context>(root => {
  return root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("greeting", (_, context) => `${context.id}`)
            el.children
              .textNode((get, context) => `${get(greeting)}, ${context.name}!`)
          })
          .div(el => {
            el.config
              .dataAttribute("counter", (_, context) => `${context.id}`)
            el.children
              .textNode((get, context) => `${get(context.counter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .button(el => {
            el.config
              .dataAttribute("increment-counter", (_, context) => `${context.id}`)
              .on("click", (_, context) => {
                return use(rule((get) => {
                  return write(context.counter, get(context.counter) + 1)
                }))
              })
            el.children
              .textNode("Click me!")
          })
      })
  })
})