import { Container, container, derived, DerivedState } from "@store/index.js"
import { HTMLBuilder } from "@view/index"
import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { selectElement } from "./helpers/displayElement"
import { renderContext } from "./helpers/renderContext"

interface ConditionalGlitchContext {
  show: Container<boolean>
  rootContainer: Container<string>
  isOn: DerivedState<boolean>
  label: DerivedState<string>
}

export default behavior("glitch-free state in a conditional view", [
  example(renderContext<ConditionalGlitchContext>())
    .description(
      "derived state declared in a view that starts reading external derived state during the update that changes it",
    )
    .script({
      suppose: [
        fact("there is external state", (context) => {
          const rootContainer = container({ initialValue: "off" })
          context.setState({
            show: container({ initialValue: true }),
            rootContainer,
            isOn: derived((get) => get(rootContainer) === "on"),
            label: derived((get) => `${get(rootContainer)} label`),
          })
        }),
        fact(
          "there is a conditional view with derived state that only reads the external label once a condition is true",
          (context) => {
            function panel(root: HTMLBuilder) {
              const decorated = derived((get) =>
                get(context.state.isOn) ? `decorated ${get(context.state.label)}` : "nothing",
              )

              root.p((el) => {
                el.config.dataAttribute("decorated")
                el.children.textNode((get) => get(decorated))
              })
            }

            context.mountView((root) => {
              root.main((el) => {
                el.children
                  .subviewMatching((selector) =>
                    selector.withConditions().when((get) => get(context.state.show), panel),
                  )
                  .p((el) => {
                    el.config.dataAttribute("label")
                    el.children.textNode((get) => get(context.state.label))
                  })
              })
            })
          },
        ),
      ],
      perform: [
        step("the root container is updated so the condition is true", (context) => {
          context.writeTo(context.state.rootContainer, "on")
        }),
      ],
      observe: [
        effect(
          "the view's derived state shows the value derived from the updated state",
          async () => {
            await expect(selectElement("[data-decorated]").text(), resolvesTo("decorated on label"))
          },
        ),
        effect("the label shows the value derived from the updated state", async () => {
          await expect(selectElement("[data-label]").text(), resolvesTo("on label"))
        }),
      ],
    }),

  example(renderContext<ConditionalGlitchContext>())
    .description(
      "derived state declared in a view that starts reading external derived state the view already displays, during the update that changes it",
    )
    .script({
      suppose: [
        fact("there is external state", (context) => {
          const rootContainer = container({ initialValue: "off" })
          context.setState({
            show: container({ initialValue: true }),
            rootContainer,
            isOn: derived((get) => get(rootContainer) === "on"),
            label: derived((get) => `${get(rootContainer)} label`),
          })
        }),
        fact(
          "there is a conditional view that displays the external label and has derived state that only reads it once a condition is true",
          (context) => {
            function panel(root: HTMLBuilder) {
              const decorated = derived((get) =>
                get(context.state.isOn) ? `decorated ${get(context.state.label)}` : "nothing",
              )

              root.div((el) => {
                el.children
                  .p((el) => {
                    el.config.dataAttribute("decorated")
                    el.children.textNode((get) => get(decorated))
                  })
                  .p((el) => {
                    el.config.dataAttribute("label")
                    el.children.textNode((get) => get(context.state.label))
                  })
              })
            }

            context.mountView((root) => {
              root.main((el) => {
                el.children.subviewMatching((selector) =>
                  selector.withConditions().when((get) => get(context.state.show), panel),
                )
              })
            })
          },
        ),
      ],
      perform: [
        step("the root container is updated so the condition is true", (context) => {
          context.writeTo(context.state.rootContainer, "on")
        }),
      ],
      observe: [
        effect(
          "the view's derived state shows the value derived from the updated state",
          async () => {
            await expect(selectElement("[data-decorated]").text(), resolvesTo("decorated on label"))
          },
        ),
        effect("the label shows the value derived from the updated state", async () => {
          await expect(selectElement("[data-label]").text(), resolvesTo("on label"))
        }),
      ],
    }),
])
