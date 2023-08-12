import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { DisplayElement, TestApp } from "../helpers/testApp.js";
import { equalTo, expect, resolvesTo, stringContaining } from "great-expectations";

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
          await expect(celsiusField(context).inputValue(), resolvesTo(equalTo("")))
        }),
        effect("the farenheit text is empty", async (context) => {
          await expect(farenheitField(context).inputValue(), resolvesTo(equalTo("")))
        })
      ]
    }),

  example(context)
    .description("convert celsius to farenheit")
    .script({
      suppose: [
        fact("the converter is rendered", async (context) => {
          await context.renderApp("converter")
        })
      ],
      perform: [
        step("set the temperature in celsius", async (context) => {
          await celsiusField(context).type("5")
        })
      ],
      observe: [
        effect("the farenheit field is updated", async (context) => {
          await expect(farenheitField(context).inputValue(), resolvesTo(equalTo("41.0")))
        })
      ]
    }).andThen({
      perform: [
        step("set the temperature in farenheit", async (context) => {
          await farenheitField(context).type("76")
        })
      ],
      observe: [
        effect("the celsius field is updated", async (context) => {
          await expect(celsiusField(context).inputValue(), resolvesTo(equalTo("24.4")))
        })
      ]
    }),

  example(context)
    .description("convert farenheit to celsius")
    .script({
      suppose: [
        fact("the converter is rendered", async (context) => {
          await context.renderApp("converter")
        })
      ],
      perform: [
        step("set the temperature in farenheit", async (context) => {
          await farenheitField(context).type("68")
        })
      ],
      observe: [
        effect("the celsius field is updated", async (context) => {
          await expect(celsiusField(context).inputValue(), resolvesTo(equalTo("20.0")))
        })
      ]
    }).andThen({
      perform: [
        step("set the tempaerature in celsius", async (context) => {
          await celsiusField(context).type("28")
        })
      ],
      observe: [
        effect("the farenheit field is updated", async (context) => {
          await expect(farenheitField(context).inputValue(), resolvesTo(equalTo("82.4")))
        })
      ]
    }),

  example(context)
    .description("the celsius input is not a number")
    .script({
      suppose: [
        fact("the converter is rendered", async (context) => {
          await context.renderApp("converter")
        })
      ],
      perform: [
        step("set the temperature in farenheit", async (context) => {
          await farenheitField(context).type("68")
        }),
        step("update the celsius field with something not a number", async (context) => {
          await celsiusField(context).type("blah")
        })
      ],
      observe: [
        effect("the farenheit field value does not change", async (context) => {
          await expect(farenheitField(context).inputValue(), resolvesTo(equalTo("68")))
        }),
        effect("the celsius field is marked as invalid", async (context) => {
          await expect(celsiusField(context).classNames(), resolvesTo(stringContaining("bg-fuchsia-300")))
        }),
        effect("the farenheit field is marked as unable to calculate", async (context) => {
          await expect(farenheitField(context).classNames(), resolvesTo(stringContaining("bg-slate-300")))
        })
      ]
    }),

  example(context)
    .description("the farenheit input is not a number")
    .script({
      suppose: [
        fact("the converter is rendered", async (context) => {
          await context.renderApp("converter")
        })
      ],
      perform: [
        step("set the temperature in celsius", async (context) => {
          await celsiusField(context).type("20")
        }),
        step("update the celsius field with something not a number", async (context) => {
          await farenheitField(context).type("blah")
        })
      ],
      observe: [
        effect("the celsius field value does not change", async (context) => {
          await expect(celsiusField(context).inputValue(), resolvesTo(equalTo("20")))
        }),
        effect("the farenheit field is marked as invalid", async (context) => {
          await expect(farenheitField(context).classNames(), resolvesTo(stringContaining("bg-fuchsia-300")))
        }),
        effect("the celsius field is marked as unable to calculate", async (context) => {
          await expect(celsiusField(context).classNames(), resolvesTo(stringContaining("bg-slate-300")))
        })
      ]
    })

])

function farenheitField(context: TestApp): DisplayElement {
  return context.display.selectElement("#farenheit")
}

function celsiusField(context: TestApp): DisplayElement {
  return context.display.selectElement("#celsius")
}