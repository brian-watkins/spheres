import { behavior, effect, example, fact, step } from "best-behavior"
import { testableServerContext } from "./helpers/testableServerContext"
import { expect, is, stringMatching } from "great-expectations"

export default behavior("vite plugin", [

  example(testableServerContext)
    .description("explicit stylesheet and script imports")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context.buildServerRenderer({
            serverEntries: {
              renderer: "./behaviors/server/fixtures/ssrApp/plugin/renderer.ts"
            },
            clientEntries: {
              client: "./behaviors/server/fixtures/ssrApp/plugin/index.ts",
              tracing: "./behaviors/server/fixtures/ssrApp/plugin/tracing.ts",
              another: "./behaviors/server/fixtures/ssrApp/plugin/anotherPage.ts",
              styles: "./behaviors/server/fixtures/ssrApp/plugin/styles.css"
            }
          })
        }),
      ],
      perform: [
        step("render the html", async (context) => {
          await context.render(async () => {
            // @ts-ignore
            const { renderHTML } = await import("./fixtures/ssrApp/plugin/dist/renderer.js")
            return renderHTML()
          })
        })
      ],
      observe: [
        effect("the script import references the transpiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/client-.+\.js"><\/script>/)
          ))
        }),
        effect("the script tag for other transpiled js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/index-.+\.js">/)
          ))      
        }),
        effect("the stylesheet import references the transpiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/styles-.+\.css">/)
          ))
        }),
        effect("the link to styles referenced in the js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/client-.+\.css">/)
          ))
        }),
        effect("the script tag with a GetState function for src points to the compiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/tracing-.+\.js"><\/script>/)
          ))
        })
      ]
    })

])