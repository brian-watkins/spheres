import { Container, GetState, container, rule, use, write } from "@spheres/store"
import { HTMLView, WithProps, htmlTemplate } from "@src/index"

const message = container({ initialValue: "Find the secret!" })

interface Context {
  id: number
  counter: Container<number>
}

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .zone(funZone({ id: 1, counter: container({ initialValue: 0 }) }))
      .zone(funZone({ id: 2, counter: container({ initialValue: 0 }) }))
      .zone(funZone({ id: 3, counter: container({ initialValue: 0 }) }))
  })
})

const incrementRule = rule((get, provider: (get: GetState) => Container<number>) => {
  const counterContainer = provider(get)
  return write(counterContainer, get(counterContainer) + 1)
})

const funZone = htmlTemplate((withProps: WithProps<Context>) => {
  return root =>
    root.div(el => {
      el.children
        .zone(title("Counter Row!"))
        .div(el => {
          el.config
            .dataAttribute("secret-message")
          el.children
            .textNode(get => get(message))
        })
        .button(el => {
          el.config
            .dataAttribute("counter", withProps(props => `${props.id}`))
            .on("click", () => use(incrementRule, withProps((props) => props.counter)))
          el.children
            .textNode("Increment!")
        })
        .zone(withProps(description))
    })
})

const title = htmlTemplate((withProps: WithProps<string>) => {
  return root =>
    root.div(el => {
      el.children
        .hr()
        .h3(el => {
          el.config.on("click", () => write(message, "You found it!"))
          el.children.textNode(withProps((props) => props))
        })
    })
})

function description(props: Context, get: GetState): HTMLView {
  const count = get(props.counter)

  if (count % 2 === 0) {
    return root => root.div(el => {
      el.config.dataAttribute("message")
      el.children.textNode(`You've clicked ${count} times, which is good!`)
    })
  } else {
    return root => root.h1(el => {
      el.config.dataAttribute("message")
      el.children.textNode(`${count} clicks just doesn't feel right. Try again!`)
    })
  }
}