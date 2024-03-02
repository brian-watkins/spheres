import { Container, GetState, container, rule, use, write } from "@spheres/store"
import { HTMLBuilder } from "@src/htmlElements"
import { HTMLView, TemplateContext } from "@src/index"

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

function funZone(this: TemplateContext<Context>, root: HTMLBuilder) {
  root.div(el => {
    el.children
      // .zone(title, { props: "Counter Row!" })
      .zoneWithTemplate(title, "Counter Row!")
      .div(el => {
        el.config
          .dataAttribute("secret-message")
        el.children
          .textNode(get => get(message))
      })
      .button(el => {
        el.config
          .dataAttribute("counter", function (this: TemplateContext<Context>) { return `${this.props.id}` })
          .on("click", () => use(incrementRule, this.props.counter))
        el.children
          .textNode("Increment!")
      })
      // now the issue seems to be that this function isn't itself bound to the scope
      // of the other things because it is a function with its own this scope ...
      // this could be a deeper problem if someone writes one of the effects as a function instead of an arrow function
      .zoneWithState(description)
  })
}

function title(this: TemplateContext<string>, root: HTMLBuilder) {
  root.div(el => {
    el.children
      .hr()
      .h3(el => {
        el.config.on("click", () => write(message, "You found it!"))
        el.children.textNode(() => this.props)
      })
  })
}

function description(this: TemplateContext<Context>, get: GetState): HTMLView {
  const count = get(this.props.counter)

  if (count % 2 === 0) {
    return root => {
      root.div(el => {
        el.config.dataAttribute("message")
        el.children.textNode(`You've clicked ${count} times, which is good!`)
      })
    }
  } else {
    return root => {
      root.h1(el => {
        el.config.dataAttribute("message")
        el.children.textNode(`${count} clicks just doesn't feel right. Try again!`)
      })
    }
  }
}