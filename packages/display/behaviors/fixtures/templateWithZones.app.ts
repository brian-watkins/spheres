import { Container, GetState, container, rule, use, write } from "@spheres/store"
import { HTMLBuilder } from "@src/htmlElements"
import { WithProps } from "@src/index"

const message = container({ initialValue: "Find the secret!" })

interface Context {
  id: number
  counter: Container<number>
}

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, { id: 1, counter: container({ initialValue: 0 }) })
      .zoneWithTemplate(funZone, { id: 2, counter: container({ initialValue: 0 }) })
      .zoneWithTemplate(funZone, { id: 3, counter: container({ initialValue: 0 }) })
  })
}

const incrementRule = rule((get, counterContainer: Container<number>) => {
  return write(counterContainer, get(counterContainer) + 1)
})

function funZone(root: HTMLBuilder, withProps: WithProps<Context>) {
  root.div(el => {
    el.children
      .zoneWithTemplate(title, "Counter Row!")
      .div(el => {
        el.config
          .dataAttribute("secret-message")
        el.children
          .textNode(get => get(message))
      })
      .button(el => {
        el.config
          .dataAttribute("counter", withProps(props => `${props.id}`))
          .on("click", withProps(props => use(incrementRule, props.counter)))
        el.children
          .textNode("Increment!")
      })
      .zoneWithState(withProps((props, root, get) => description(props, root, get)))
  })
}

function title(root: HTMLBuilder, withProps: WithProps<string>) {
  root.div(el => {
    el.children
      .hr()
      .h3(el => {
        el.config.on("click", () => write(message, "You found it!"))
        el.children.textNode(withProps((props) => props))
      })
  })
}

function description(props: Context, root: HTMLBuilder, get: GetState) {
  const count = get(props.counter)

  if (count % 2 === 0) {
    root.div(el => {
      el.config.dataAttribute("message")
      el.children.textNode(`You've clicked ${count} times, which is good!`)
    })
  } else {
    root.h1(el => {
      el.config.dataAttribute("message")
      el.children.textNode(`${count} clicks just doesn't feel right. Try again!`)
    })
  }
}