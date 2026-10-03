import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { container, Container } from "@store/index"
import { renderContext } from "./helpers/renderContext"
import { selectElement } from "./helpers/displayElement"

interface ClassContext {
  className: Container<string | undefined>
}

export default behavior("class", [
  example(renderContext<ClassContext>())
    .description("reactive class set to undefined")
    .script({
      suppose: [
        fact("there is state for the class name", (app) => {
          app.setState({
            className: container<string | undefined>({ initialValue: "fun-class" }),
          })
        }),
        fact("there is a view with a div whose class is reactive", (app) => {
          app.mountView((root) => {
            root.div((el) => {
              el.config.dataAttribute("styled").class((get) => get(app.state.className))
            })
          })
        }),
      ],
      observe: [
        effect("the div has the initial class", async () => {
          await expect(
            selectElement("div[data-styled]").property("className"),
            resolvesTo("fun-class"),
          )
        }),
      ],
    })
    .andThen({
      perform: [
        step("the class name state is set to undefined", (app) => {
          app.writeTo(app.state.className, undefined)
        }),
      ],
      observe: [
        effect("the div has no class", async () => {
          await expect(selectElement("div[data-styled]").property("className"), resolvesTo(""))
        }),
      ],
    }),
])
