import { behavior, ConfigurableExample, Context, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is, resolvesTo, stringContaining } from "great-expectations";
import { browserAppContext, TestAppController } from "./helpers/testAppController.js";


const simpleViewBehavior = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("Rendering a simple view")
    .script({
      suppose: [
        fact("a view with an input and button is provided", async (controller) => {
          await controller.loadApp("simpleView.app")
        })
      ],
      observe: [
        effect("the initial data is rendered on the screen", async (controller) => {
          const texts = await controller.display.selectAll("[data-person]").map((element) => element.text())
          expect(texts, is(equalTo([
            "Cool Dude - 41",
            "Awesome Person - 28"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a new name is input", async (controller) => {
          await controller.display.select("input").type("Fun Person")
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the updated view is rendered", async (controller) => {
          const texts = await controller.display.selectAll("[data-person]").map((element) => element.text())
          expect(texts, is(equalTo([
            "Fun Person - 104",
          ])))
        })
      ]
    })

const innerHTMLViewBehavior = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("view with innerHTML element")
    .script({
      suppose: [
        fact("a view with innerHTML is displayed", async (controller) => {
          await controller.loadApp("innerHtml.app")
        })
      ],
      observe: [
        effect("it displays the inner html content", async (controller) => {
          const content = await controller.display.select("h3").text()
          expect(content, is(equalTo("Hello!!!")))
        })
      ]
    })

const reactiveInnerHTMLViewBehavior = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("view with reactive innerHTML on element")
    .script({
      suppose: [
        fact("there is a view with reactive innerHTML", async (controller) => {
          await controller.loadApp("reactiveInnerHtml.app")
        })
      ],
      observe: [
        effect("it displays the initial content", async (controller) => {
          await expect(controller.display.select("h1").text(), resolvesTo("Hello!"))
        })
      ]
    }).andThen({
      perform: [
        step("the content is updated", async (controller) => {
          await controller.display.select("input").type("<p>Some <b>bold</b> text!</p>")
        })
      ],
      observe: [
        effect("it displays the updated content", async (controller) => {
          await expect(controller.display.select("p b").text(), resolvesTo("bold"))
        })
      ]
    })

const nestedViewsBehavior = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("nested views")
    .script({
      suppose: [
        fact("some state is provided for the view", async (controller) => {
          await controller.loadApp("nestedView.app")
        })
      ],
      observe: [
        effect("it displays the default name and age", async (controller) => {
          const nameText = await controller.display.select("[data-name]").text()
          expect(nameText, is(stringContaining("hello")))

          const ageText = await controller.display.select("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the name state is updated", async (controller) => {
          await controller.display.select("[data-name-input]").type("Fun Person")
        })
      ],
      observe: [
        effect("the updated name is displayed", async (controller) => {
          const nameText = await controller.display.select("[data-name]").text()
          expect(nameText, is(stringContaining("Fun Person")))
        }),
        effect("the age remains the same", async (controller) => {
          const ageText = await controller.display.select("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the age state is updated", async (controller) => {
          await controller.display.select("[data-age-input]").type("33")
        })
      ],
      observe: [
        effect("the updated age is displayed", async (controller) => {
          const ageText = await controller.display.select("[data-age]").text()
          expect(ageText, is(stringContaining("33")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the nested view is removed", async (controller) => {
          await controller.display.select("[data-name-input]").type("AGELESS PERSON", { clear: true })
        })
      ],
      observe: [
        effect("the age is not present", async (controller) => {
          const ageExists = await controller.display.select("[data-age]").exists()
          expect(ageExists, is(equalTo(false)))
        })
      ]
    })
    .andThen({
      perform: [
        step("the nested view is recreated", async (controller) => {
          await controller.display.select("[data-name-input]").type("FUNNY PERSON", { clear: true })
        })
      ],
      observe: [
        effect("the updated name is displayed", async (controller) => {
          const nameText = await controller.display.select("[data-name]").text()
          expect(nameText, is(stringContaining("FUNNY PERSON")))
        }),
        effect("the age is present once again with the current state", async (controller) => {
          const ageText = await controller.display.select("[data-age]").text()
          expect(ageText, is(stringContaining("33")))
        })
      ]
    })

const simpleRouter = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("simple router with zone show")
    .script({
      suppose: [
        fact("there is a view", async (context) => {
          await context.loadApp("simpleRouter.app")
        })
      ],
      observe: [
        effect("the home route is displayed", async (context) => {
          const text = await context.display.select("h3").text()
          expect(text, is("Welcome home!"))
        }),
        effect("no other route is displayed", async (context) => {
          await expect(context.display.select("p").exists(), resolvesTo(false))
          await expect(context.display.select("h1").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("when the big route is selected", async (context) => {
          await context.display.select("select").selectOption("Big")
        })
      ],
      observe: [
        effect("the route is an h1", async (context) => {
          const text = await context.display.select("h1").text()
          expect(text, is("Big text!"))
        }),
        effect("the other routes are not displayed", async (context) => {
          await expect(context.display.select("p").exists(), resolvesTo(false))
          await expect(context.display.select("h3").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("another route is selected", async (context) => {
          await context.display.select("select").selectOption("Regular")
        })
      ],
      observe: [
        effect("the route is a p", async (context) => {
          const text = await context.display.select("p").text()
          expect(text, is("Regular text!"))
        }),
        effect("the other routes are not displayed", async (context) => {
          await expect(context.display.select("h1").exists(), resolvesTo(false))
          await expect(context.display.select("h3").exists(), resolvesTo(false))
        })
      ]
    })

const svgRouter = (context: Context<TestAppController>): ConfigurableExample =>
  example(context)
    .description("simple router with svg zones")
    .script({
      suppose: [
        fact("there is a view", async (context) => {
          await context.loadApp("svgRouter.app")
        })
      ],
      observe: [
        effect("no shape is shown", async (context) => {
          await expect(context.display.select("[data-shape='square']").exists(), resolvesTo(false))
          await expect(context.display.select("[data-shape='circle']").exists(), resolvesTo(false))
          await expect(context.display.select("[data-shape='rectangle']").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("the circle is selected", async (context) => {
          await context.display.select("select").selectOption("Circle")
        })
      ],
      observe: [
        effect("the circle is displayed", async (context) => {
          await expect(context.display.select("[data-shape='square']").exists(), resolvesTo(false))
          await expect(context.display.select("[data-shape='circle']").exists(), resolvesTo(true))
          await expect(context.display.select("[data-shape='rectangle']").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("the rectangle is selected", async (context) => {
          await context.display.select("select").selectOption("Rectangle")
        })
      ],
      observe: [
        effect("the circle is displayed", async (context) => {
          await expect(context.display.select("[data-shape='square']").exists(), resolvesTo(false))
          await expect(context.display.select("[data-shape='circle']").exists(), resolvesTo(false))
          await expect(context.display.select("[data-shape='rectangle']").exists(), resolvesTo(true))
        })
      ]
    })

export default behavior("view", [
  simpleViewBehavior(browserAppContext()),
  innerHTMLViewBehavior(browserAppContext()),
  reactiveInnerHTMLViewBehavior(browserAppContext()),
  nestedViewsBehavior(browserAppContext()),
  simpleRouter(browserAppContext()),
  svgRouter(browserAppContext())
])