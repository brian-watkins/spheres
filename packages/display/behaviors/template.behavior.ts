import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, resolvesTo } from "great-expectations";
import { TestAppController, browserAppContext } from "helpers/testAppController";
import { DisplayElement } from "helpers/testDisplay";

export default behavior("template", [

  example(browserAppContext())
    .description("a template and context")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("template.app")
        })
      ],
      observe: [
        effect("the template is rendered with the first context", async (controller) => {
          const text = await controller.display.select("[data-greeting='1']").text()
          expect(text, is("Hello, Cool dude!"))
        }),
        effect("the template is rendered with the second context", async (controller) => {
          const text = await controller.display.select("[data-greeting='2']").text()
          expect(text, is("Hello, Awesome person!"))
        }),
        effect("the template is rendered with the third context", async (controller) => {
          const text = await controller.display.select("[data-greeting='3']").text()
          expect(text, is("Hello, Fun human!"))
        })
      ]
    }).andThen({
      perform: [
        step("click the second counter", async (context) => {
          await context.display.select("[data-increment-counter='2']").click()
          await context.display.select("[data-increment-counter='2']").click()
          await context.display.select("[data-increment-counter='2']").click()
        }),
        step("click the third counter", async (context) => {
          await context.display.select("[data-increment-counter='3']").click()
          await context.display.select("[data-increment-counter='3']").click()
        })
      ],
      observe: [
        effect("the click counter does not increment for the first zone", async (context) => {
          await expect(context.display.select("[data-counter='1']").text(), resolvesTo("0 clicks!"))
        }),
        effect("the click counter increments for the second zone", async (context) => {
          await expect(context.display.select("[data-counter='2']").text(), resolvesTo("3 clicks!"))
        }),
        effect("the click counter increments for the third zone", async (context) => {
          await expect(context.display.select("[data-counter='3']").text(), resolvesTo("2 clicks!"))
        })
      ]
    }),

  example(browserAppContext())
    .description("a template that contains a reactive zone")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("templateWithZones.app")
        })
      ],
      observe: [
        effect("it shows the default values for the reactive zones", async (controller) => {
          await expect(controller.display.selectAll("[data-message]").map(el => Promise.all([el.tagName(), el.text()])),
            resolvesTo([
              ["DIV", "You've clicked 0 times, which is good!"],
              ["DIV", "You've clicked 0 times, which is good!"],
              ["DIV", "You've clicked 0 times, which is good!"]
            ]))
        })
      ]
    }).andThen({
      perform: [
        step("click a counter to trigger the reactive zone update", async (context) => {
          await context.display.select("[data-counter='2']").click()
        })
      ],
      observe: [
        effect("the stateless zones are displayed", async (context) => {
          await expect(context.display.selectAll("h3").map(el => el.text()), resolvesTo([
            "Counter Row!",
            "Counter Row!",
            "Counter Row!"
          ]))
        }),
        effect("the second zone is patched", async (context) => {
          await expect(context.display.selectAll("[data-message]").map(el => Promise.all([el.tagName(), el.text()])),
            resolvesTo([
              ["DIV", "You've clicked 0 times, which is good!"],
              ["H1", "1 clicks just doesn't feel right. Try again!"],
              ["DIV", "You've clicked 0 times, which is good!"]
            ]))
        }),
      ]
    }).andThen({
      perform: [
        step("the second button is clicked again", async (context) => {
          await context.display.select("[data-counter='2']").click()
        })
      ],
      observe: [
        effect("the second zone is patched again", async (context) => {
          await expect(context.display.selectAll("[data-message]").map(el => Promise.all([el.tagName(), el.text()])),
            resolvesTo([
              ["DIV", "You've clicked 0 times, which is good!"],
              ["DIV", "You've clicked 2 times, which is good!"],
              ["DIV", "You've clicked 0 times, which is good!"]
            ]))
        }),
      ]
    }).andThen({
      perform: [
        step("click the event handler in the static zone", async (context) => {
          await context.display.select("h3").click()
        })
      ],
      observe: [
        effect("the secret message is revealed", async (context) => {
          await expect(context.display.selectAll("[data-secret-message]").map(el => el.text()),
            resolvesTo([
              "You found it!",
              "You found it!",
              "You found it!"
            ]))
        })
      ]
    }),

  example(browserAppContext())
    .description("nested templates")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("nestedTemplates.app")
        })
      ],
      perform: [
        step("click the button in the nested template", async (controller) => {
          await controller.display.selectWithText("Increment the counter!").click()
          await controller.display.selectWithText("Increment the counter!").click()
        })
      ],
      observe: [
        effect("the counter increments as expected", async (controller) => {
          await expect(controller.display.selectAll("[data-counter]").map(el => el.text()),
            resolvesTo([
              "Cool dude - 2 clicks!",
              "Awesome person - 2 clicks!",
              "Fun human - 2 clicks!"
            ]))
        })
      ]
    }).andThen({
      perform: [
        step("click a reset button", async (context) => {
          await context.display.selectWithText("Click me to reset!").click()
        })
      ],
      observe: [
        effect("the counter is reset to zero", async (controller) => {
          await expect(controller.display.selectAll("[data-counter]").map(el => el.text()),
            resolvesTo([
              "Cool dude - 0 clicks!",
              "Awesome person - 0 clicks!",
              "Fun human - 0 clicks!"
            ]))
        })
      ]
    }),

  example(browserAppContext())
    .description("svg template")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("svgTemplate.app")
        })
      ],
      observe: [
        effect("it renders the circles with the appropriate labels", async (context) => {
          await expect(circleButton(context, 1).text(), resolvesTo("0"))
          await expect(circleButton(context, 2).text(), resolvesTo("0"))
          await expect(circleButton(context, 3).text(), resolvesTo("0"))
        })
      ]
    }).andThen({
      perform: [
        step("the middle counter button is clicked a few times", async (context) => {
          await circleButton(context, 2).click()
          await circleButton(context, 2).click()
          await circleButton(context, 2).click()
        }),
        step("click the last counter a few times", async (context) => {
          await circleButton(context, 3).click()
          await circleButton(context, 3).click()
        })
      ],
      observe: [
        effect("the middle and last button labels are updated", async (context) => {
          await expect(circleButton(context, 1).text(), resolvesTo("0"))
          await expect(circleButton(context, 2).text(), resolvesTo("3"))
          await expect(circleButton(context, 3).text(), resolvesTo("2"))
        })
      ]
    })

])

function circleButton(context: TestAppController, id: number): DisplayElement {
  return context.display.select(`[data-circle-button='${id}']`)
}