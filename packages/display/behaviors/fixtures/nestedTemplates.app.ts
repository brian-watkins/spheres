import { Container, StoreMessage, container, reset, rule, use, write } from "@spheres/store";
import { View, htmlTemplate, htmlView } from "@src/index";

interface Context {
  id: number
  name: string
}

const clickCounter = container({ initialValue: 0 })


export default function (): View {
  return htmlView(root => {
    root.main(el => {
      el.children
        .zone(funZone({ id: 1, name: "Cool dude" }))
        .zone(funZone({ id: 2, name: "Awesome person" }))
        .zone(funZone({ id: 3, name: "Fun human" }))
        .hr()
        .zone(button({
          name: "increment",
          label: "Increment the counter!",
          handler: () => use(incrementRule, clickCounter)
        }))
    })
  })
}

const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

const funZone = htmlTemplate<Context>(root => {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("counter", (_, context) => `${context.id}`)
            el.children
              .textNode((get, context) => `${context.name} - ${get(clickCounter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .zone(button({
            name: "increment",
            label: `Click me to reset!`,
            handler: () => reset(clickCounter)
          }))
      })
  })
})

interface ButtonContext {
  name: string
  handler: (evt: Event) => StoreMessage<any>
  label: string
}

const button = htmlTemplate<ButtonContext>(root => {
  root.button(el => {
    el.config
      .dataAttribute("button-name", (_, context) => context.name)
      .on("click", (evt, context) => context.handler(evt))
    el.children
      .textNode((_, context) => context.label)
  })
})

