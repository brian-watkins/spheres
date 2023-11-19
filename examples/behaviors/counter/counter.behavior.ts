import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations"
import { testAppContext } from "../helpers/testApp.js";

export default behavior("counter", [
  example(testAppContext)
    .description("just a test")
    .script({
      suppose: [
        fact("the counter app is displayed", async (context) => {
          await context.renderApp("counter")
        })
      ],
      observe: [
        effect("zero clicks are shown by default", async (context) => {
          const text = await context.display.selectElement("[data-counter-text]").text()
          expect(text, is(equalTo("Clicks: 0")))
        })
      ]
    }).andThen({
      perform: [
        step("click the button 3 times", async (context) => {
          await context.display.selectElement("button").click()
          await context.display.selectElement("button").click()
          await context.display.selectElement("button").click()
        })
      ],
      observe: [
        effect("the count shows three clicks", async (context) => {
          const text = await context.display.selectElement("[data-counter-text]").text()
          expect(text, is(equalTo("Clicks: 3")))
        })
      ]
    })
])