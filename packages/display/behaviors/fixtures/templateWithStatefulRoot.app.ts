import { Container, GetState, container } from "@spheres/store"
import { HTMLBuilder, WithProps } from "@src/index"

interface Context {
  id: number
  counter: Container<number>
}

export default function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .zoneWithTemplate(funZone, { id: 1, counter: container({ initialValue: 1 }) })
      .zoneWithTemplate(funZone, { id: 2, counter: container({ initialValue: 2 }) })
      .zoneWithTemplate(funZone, { id: 3, counter: container({ initialValue: 3 }) })
  })
}

function funZone(root: HTMLBuilder, withProps: WithProps<Context>) {
  root.zoneWithState(withProps((props, root, get) => statefulFunZone(props, root, get)))
}

function statefulFunZone(props: Context, root: HTMLBuilder, get: GetState) {
  root.h1(el => {
    el.config.dataAttribute("fun-zone", `${props.id}`)
    el.children.textNode(`${get(props.counter)}`)
  })
}