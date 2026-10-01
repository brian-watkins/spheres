import { Container, container, derived } from "@store/index.js"
import { HTMLBuilder } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElement } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface ConditionalStateContext {
  show: Container<boolean>
  focused: Container<boolean>
}

export default behavior("state declared in a conditional view", [
  example(renderContext<ConditionalStateContext>())
    .description("derived state declared in a view that is removed and shown again")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            focused: container({ initialValue: false }),
          })
        }),
        fact("there is a conditional view that declares derived state", (context) => {
          function panel(root: HTMLBuilder) {
            const isFocused = derived((get) => get(context.state.focused))

            root.p((el) => {
              el.children.textNode((get) => `Focused: ${get(isFocused)}`)
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector.withConditions().when((get) => get(context.state.show), panel),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the derived state is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("reset the state", (context) => {
          context.writeTo(context.state.focused, false)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the derived state is shown with the latest value", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state again", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    }),

  example(renderContext<ConditionalStateContext>())
    .description("derived state declared in a union view that is removed and shown again")
    .script({
      suppose: [
        fact("there is some state", (context) => {
          context.setState({
            show: container({ initialValue: true }),
            focused: container({ initialValue: false }),
          })
        }),
        fact("there is a union view that declares derived state", (context) => {
          function panel(root: HTMLBuilder) {
            const isFocused = derived((get) => get(context.state.focused))

            root.p((el) => {
              el.children.textNode((get) => `Focused: ${get(isFocused)}`)
            })
          }

          context.mountView((root) => {
            root.main((el) => {
              el.children.subviewMatching((selector) =>
                selector
                  .withUnion((get) => get(context.state.show))
                  .when(
                    (val): val is true => val === true,
                    () => panel,
                  ),
              )
            })
          })
        }),
      ],
      observe: [
        effect("the derived state is shown", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("reset the state", (context) => {
          context.writeTo(context.state.focused, false)
        }),
        step("hide the view", (context) => {
          context.writeTo(context.state.show, false)
        }),
        step("show the view again", (context) => {
          context.writeTo(context.state.show, true)
        }),
      ],
      observe: [
        effect("the derived state is shown with the latest value", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: false"))
        }),
      ],
    })
    .andThen({
      perform: [
        step("update the state again", (context) => {
          context.writeTo(context.state.focused, true)
        }),
      ],
      observe: [
        effect("the derived state updates", async () => {
          await expect(selectElement("p").text(), resolvesTo("Focused: true"))
        }),
      ],
    }),
])
