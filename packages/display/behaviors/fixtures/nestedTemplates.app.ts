import { Container, StoreMessage, container, reset, rule, use, write } from "@spheres/store";
import { HTMLBuilder } from "@src/htmlElements";
import { WithProps } from "@src/index";

interface Context {
  id: number
  name: string
}

const clickCounter = container({ initialValue: 0 })

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, { id: 1, name: "Cool dude" })
      .zoneWithTemplate(funZone, { id: 2, name: "Awesome person" })
      .zoneWithTemplate(funZone, { id: 3, name: "Fun human" })
      .hr()
      .zoneWithTemplate(button, {
        name: "increment",
        label: "Increment the counter!",
        handler: () => use(incrementRule, clickCounter)
      })
  })
}


const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

function funZone(root: HTMLBuilder, withProps: WithProps<Context>) {
  root.div(el => {
    el.children
      .hr()
      .div(el => {
        el.children
          .div(el => {
            el.config
              .dataAttribute("counter", withProps(props => `${props.id}`))
            el.children
              .textNode(withProps((props, get) => `${props.name} - ${get(clickCounter)} clicks!`))
          })
      })
      .div(el => {
        el.children
          .zoneWithTemplate(button, {
            name: "increment",
            label: `Click me to reset!`,
            handler: () => reset(clickCounter)
          })
      })
  })
}

interface ButtonContext {
  name: string
  handler: (evt: Event) => StoreMessage<any>
  label: string
}

function button(root: HTMLBuilder, withProps: WithProps<ButtonContext>) {
  root.button(el => {
    el.config
      .dataAttribute("button-name", withProps(props => props.name))
      .on("click", withProps((props, evt) => props.handler(evt)))
    el.children
      .textNode(withProps(props => props.label))
  })
}

