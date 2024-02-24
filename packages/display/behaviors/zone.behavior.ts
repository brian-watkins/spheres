import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, resolvesTo } from "great-expectations";
import { browserAppContext } from "helpers/testAppController";

export default behavior("zone", [

  example(browserAppContext())
    .description("a zone with a template and context")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("zone.app")
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
              [ "DIV", "You've clicked 0 times, which is good!" ],
              [ "DIV", "You've clicked 0 times, which is good!" ],
              [ "DIV", "You've clicked 0 times, which is good!" ]
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
              [ "DIV", "You've clicked 0 times, which is good!" ],
              [ "H1", "1 clicks just doesn't feel right. Try again!" ],
              [ "DIV", "You've clicked 0 times, which is good!" ]
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
              [ "DIV", "You've clicked 0 times, which is good!" ],
              [ "DIV", "You've clicked 2 times, which is good!" ],
              [ "DIV", "You've clicked 0 times, which is good!" ]
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
    })

])