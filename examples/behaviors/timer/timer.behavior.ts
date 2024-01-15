import { Action, Observation, Presupposition, behavior, effect, example, fact, step } from "esbehavior";
import { DisplayElement, TestApp, testAppContext } from "../helpers/testApp.js";
import { expect, resolvesTo } from "great-expectations";

export default behavior("timer", [

  example(testAppContext)
    .description("default state")
    .script({
      suppose: [
        theTimerIsRendered()
      ],
      observe: [
        effect("the duration slider is at zero", async (context) => {
          await expect(durationInput(context).inputValue(), resolvesTo("0"))
        }),
        effect("the elapsed time is zero seconds", async (context) => {
          await expect(elapsedTime(context).text(), resolvesTo("0.0s"))
        }),
        effect("the elapsed time indicator is at zero", async (context) => {
          await expect(progressMeter(context).attribute("value"), resolvesTo("0"))
        })
      ]
    }),

  example(testAppContext)
    .description("run the timer to completion")
    .script({
      suppose: [
        theTimerIsRendered()
      ],
      perform: [
        setTimerDuration(2000),
        timePassesInMillis(500)
      ],
      observe: [
        itShowsElapsedTime("0.5s"),
        itShowsPercentComplete("0.25")
      ]
    }).andThen({
      perform: [
        timePassesInMillis(1000)
      ],
      observe: [
        itShowsElapsedTime("1.5s"),
        itShowsPercentComplete("0.75")
      ]
    }).andThen({
      perform: [
        timePassesInMillis(800)
      ],
      observe: [
        itShowsElapsedTime("2.0s", "the timer stops when the duration is reached"),
        itShowsPercentComplete("1.00", "the progress meter is filled")
      ]
    }),

  example(testAppContext)
    .description("adjust the duration while the timer is running to less than the elapsed time")
    .script({
      suppose: [
        theTimerIsRendered()
      ],
      perform: [
        setTimerDuration(2000),
        timePassesInMillis(1200),
        setTimerDuration(1000),
        timePassesInMillis(200)
      ],
      observe: [
        itShowsElapsedTime("1.0s"),
        itShowsPercentComplete("1.00")
      ]
    }).andThen({
      perform: [
        setTimerDuration(3000),
        timePassesInMillis(300)
      ],
      observe: [
        itShowsElapsedTime("1.3s"),
        itShowsPercentComplete("0.43")
      ]
    }),

  example(testAppContext)
    .description("adjust the duration while the timer is running to give it more time")
    .script({
      suppose: [
        theTimerIsRendered()
      ],
      perform: [
        setTimerDuration(1000),
        timePassesInMillis(400),
        setTimerDuration(3000),
        timePassesInMillis(200)
      ],
      observe: [
        itShowsElapsedTime("0.6s"),
        itShowsPercentComplete("0.20")
      ]
    }),

  example(testAppContext)
    .description("reset the time while it is running")
    .script({
      suppose: [
        theTimerIsRendered()
      ],
      perform: [
        setTimerDuration(1000),
        timePassesInMillis(400),
        resetTimer(),
        timePassesInMillis(300)
      ],
      observe: [
        itShowsElapsedTime("0.3s"),
        itShowsPercentComplete("0.30")
      ]
    })

])

function theTimerIsRendered(): Presupposition<TestApp> {
  return fact("the timer is rendered", async (context) => {
    await context.renderApp("timer")
  })
}

function timePassesInMillis(millis: number): Action<TestApp> {
  return step(`${millis}ms passes`, async (context) => {
    await context.display.tick(millis)
  })
}

function setTimerDuration(millis: number): Action<TestApp> {
  return step(`the duration is adjusted to ${millis}ms`, async (context) => {
    await durationInput(context).setValue((millis / 1000).toFixed(0))
  })
}

function resetTimer(): Action<TestApp> {
  return step("the elapsed time is reset to zero", async (context) => {
    await context.display.selectElement("[data-reset-button]").click()
  })
}

function itShowsElapsedTime(time: string, description: string = "the elapsed time reflects the time that has passed"): Observation<TestApp> {
  return effect(description, async (context) => {
    await expect(elapsedTime(context).text(), resolvesTo(time))
  })
}

function itShowsPercentComplete(value: string, description: string = "the progress meter reflects the time that has passed"): Observation<TestApp> {
  return effect(description, async (context) => {
    await expect(progressMeter(context).attribute("value"), resolvesTo(value), description)
  })
}

function durationInput(context: TestApp): DisplayElement {
  return context.display.selectElement("[data-duration]")
}

function progressMeter(context: TestApp): DisplayElement {
  return context.display.selectElement("progress")
}

function elapsedTime(context: TestApp): DisplayElement {
  return context.display.selectElement("[data-elapsed-time]")
}