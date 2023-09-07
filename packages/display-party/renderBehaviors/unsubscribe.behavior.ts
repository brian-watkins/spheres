import { behavior, effect, example, fact, step } from "esbehavior";
import { renderContext } from "./helpers/renderContext.js";
import { addAttribute, makeReactiveTextNode, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { Container, container } from "state-party";
import { selectElement } from "helpers/displayElement.js";
import { expect, is, resolvesTo } from "great-expectations";

interface UnsubscribeContext {
  queryCount: number
  container: Container<string>
}

export default behavior("unsubscribe", [

  example(renderContext<UnsubscribeContext>())
    .description("remove stateful element")
    .script({
      suppose: [
        fact("there is a stateful element", (context) => {
          context.setState({
            queryCount: 0,
            container: container({ initialValue: "tennis" })
          })
          const nestedStatefulChild = makeVirtualElement("section", virtualNodeConfig(), [
            makeStatefulElement(virtualNodeConfig(), (get) => {
              context.state.queryCount++
              const config = virtualNodeConfig()
              addAttribute(config, "class", "funny")
              return makeVirtualElement("div", config, [
                makeVirtualTextNode(`Your favorite sport is: ${get(context.state.container)}`)
              ])
            })
          ])
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            nestedStatefulChild
          ]))
        })
      ],
      observe: [
        effect("the element was displayed", async () => {
          await expect(selectElement(".funny").text(), resolvesTo("Your favorite sport is: tennis"))
        }),
        effect("the query is executed", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the stateful element is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), []))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "running")
        })
      ],
      observe: [
        effect("the query is not executed again", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }),

  example(renderContext<UnsubscribeContext>())
    .description("remove reactive text")
    .script({
      suppose: [
        fact("there is an element with reactive text", (context) => {
          context.setState({
            queryCount: 0,
            container: container({ initialValue: "tennis" })
          })
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeReactiveTextNode((get) => {
              context.state.queryCount++
              return `My favorite sport is ${get(context.state.container)}`
            })
          ]))
        })
      ],
      observe: [
        effect("the text is displayed", async () => {
          await expect(selectElement("div").text(), resolvesTo("My favorite sport is tennis"))
        }),
        effect("the query was executed", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the reactive text is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualTextNode("goodbye")
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "blah")
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("div").text(), resolvesTo("goodbye"))
        }),
        effect("the query is not executed again", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    })

])