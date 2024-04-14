import { Container, GetState, container } from "@spheres/store"
import { HTMLView, WithArgs, htmlTemplate } from "@src/index"

interface Context {
  id: number
  counter: Container<number>
}

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .zone(funZone({ id: 1, counter: container({ initialValue: 1 }) }))
      .zone(funZone({ id: 2, counter: container({ initialValue: 2 }) }))
      .zone(funZone({ id: 3, counter: container({ initialValue: 3 }) }))
  })
})

const funZone = htmlTemplate((withArgs: WithArgs<Context>) => {
  return root =>
    root.zone(withArgs(statefulFunZone))
})

function statefulFunZone(props: Context, get: GetState): HTMLView {
  return root =>
    root.h1(el => {
      el.config.dataAttribute("fun-zone", `${props.id}`)
      el.children.textNode(`${get(props.counter)}`)
    })
}