import { Context, behavior, effect, example, fact } from "esbehavior";
import { TestApp } from "../helpers/testApp.js";
import { equalTo, expect, is } from "great-expectations";

export default (context: Context<TestApp>) => behavior("temperature converter", [
  example(context)
    .description("default state")
    .script({
      suppose: [
        fact("the converter is rendered", async (context) => {
          await context.renderApp("converter")
        })
      ],
      observe: [
        effect("the celsius text is empty", async (context) => {
          const celsiusText = await context.display.selectElement("#celsius").text()
          expect(celsiusText, is(equalTo("")))
        }),
        effect("the farenheit text is empty", async (context) => {
          const farenheitText = await context.display.selectElement("#farenheit").text()
          expect(farenheitText, is(equalTo("")))
        })
      ]
    })

])