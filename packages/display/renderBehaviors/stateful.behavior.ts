import { Container, container } from "@spheres/store";
import { makeStatefulTextNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { renderContext } from "helpers/renderContext";

interface StatefulTextContext {
  container: Container<number>
  callCount: number
}

export default behavior("stateful views", [

  example(renderContext<StatefulTextContext>())
    .description("stateful text that is removed")
    .script({
      suppose: [
        fact("there is a view with stateful text", (context) => {
          const data: StatefulTextContext = {
            container: container({ initialValue: 0 }),
            callCount: 0
          }
          
          context.setState(data)

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeStatefulTextNode((get) => {
              data.callCount++
              return `This is the count: ${get(data.container)}`
            })
          ]))
        })
      ],
      perform: [
        step("the state dependency is updated", (context) => {
          context.writeTo(context.state.container, 20)
        })
      ],
      observe: [
        effect("the stateful generator was called twice", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    }).andThen({
      perform: [
        step("the view is patched and the stateful text is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualTextNode("This is just static text.")
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, 2)
        })
      ],
      observe: [
        effect("the call count remains the same", (context) => {
          expect(context.state.callCount, is(2))
        })
      ]
    })
  
])