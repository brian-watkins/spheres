import { behavior, ConfigurableExample, Context, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is, stringContaining } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";


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


export default (context: Context<TestAppController>) => behavior("view", [
  simpleViewBehavior(context),
  innerHTMLViewBehavior(context),
  nestedViewsBehavior(context),
])