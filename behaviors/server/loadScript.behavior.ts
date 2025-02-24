import { behavior, effect, example, fact, step } from "best-behavior"
import { testableServerContext } from "./helpers/testableServerContext"
import { expect, is, stringMatching } from "great-expectations"

export default behavior("load script during ssr after build", [

  example(testableServerContext)
    .description("explicit stylesheet and script imports")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context.buildServerRenderer()
        }),
      ],
      perform: [
        step("render the html", async (context) => {
          await context.render()
        })
      ],
      observe: [
        effect("the script import references the transpiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/activate-.+\.js"><\/script>/)
          ))
        }),
        effect("the stylesheet import references the transpiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/styles-.+\.css">/)
          ))
        })
      ]
    })

])