import { Container, StoreMessage, container, reset, rule, use, write } from "@spheres/store";
import { WithArgs, htmlTemplate } from "@src/index";

interface Context {
  id: number
  name: string
}

const clickCounter = container({ initialValue: 0 })

export default htmlTemplate(() => root => {
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


const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

const funZone = htmlTemplate((withArgs: WithArgs<Context>) => {
  return root =>
    root.div(el => {
      el.children
        .hr()
        .div(el => {
          el.children
            .div(el => {
              el.config
                .dataAttribute("counter", withArgs(props => `${props.id}`))
              el.children
                .textNode(withArgs((props, get) => `${props.name} - ${get(clickCounter)} clicks!`))
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

const button = htmlTemplate((withArgs: WithArgs<ButtonContext>) => {
  return root =>
    root.button(el => {
      el.config
        .dataAttribute("button-name", withArgs(props => props.name))
        .on("click", (evt) => use(rule(withArgs((props) => props.handler(evt)))))
      el.children
        .textNode(withArgs(props => props.label))
    })
})

