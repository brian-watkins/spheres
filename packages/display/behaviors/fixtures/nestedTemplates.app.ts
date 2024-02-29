import { Container, StoreMessage, container, reset, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";

interface Context {
  id: number
  name: string
}

const clickCounter = container({ initialValue: 0 })

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zone(funZone, {
        props: { id: 1, name: "Cool dude" }
      })
      .zone(funZone, {
        props: { id: 2, name: "Awesome person" }
      })
      .zone(funZone, {
        props: { id: 3, name: "Fun human" }
      })
      .hr()
      .zone(button, {
        props: {
          name: "increment",
          label: "Increment the counter!",
          handler: () => use(incrementRule, clickCounter)
        }
      })
  })
}


const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

function funZone(root: HTMLBuilder<Context>) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("counter", (_, props) => `${props.id}`)
            el.children
              .textNode((get, props) => `${props.name} - ${get(clickCounter)} clicks!`)
          })
      })
      .div(el => {
        el.children
          .zone(button, {
            props: {
              name: "increment",
              label: `Click me to reset!`,
              handler: () => reset(clickCounter)
            }
          })
      })
  })
}

interface ButtonContext {
  name: string
  handler: (evt: Event) => StoreMessage<any>
  label: string
}

function button(root: HTMLBuilder<ButtonContext>) {
  root.button(el => {
    el.config
      .dataAttribute("button-name", (_, props) => props.name)
      .on("click", (evt, context) => context.handler(evt))
    el.children
      .textNode((_, props) => props.label)
  })
}

