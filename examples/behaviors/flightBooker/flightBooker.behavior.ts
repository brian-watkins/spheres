import { Observation, behavior, effect, example, fact, step } from "esbehavior";
import { DisplayElement } from "../helpers/testApp.js";
import { assignedWith, expect, is, resolvesTo, satisfying, stringContaining, stringWithLength } from "great-expectations";
import { DateTime } from "luxon"
import { FlightTypes } from "../../src/flightBooker/state.js";
import { FlightBookerTestApp, flightBookerApp } from "./helpers/testApp.js";

export default behavior("Flight Booker", [

  example(flightBookerApp)
    .description("default state")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      observe: [
        effect("one-way flight is selected", async (context) => {
          const val = await flightSelector(context).inputValue()
          expect(val, is("one-way flight"))
        }),
        effect("start date has some value", async (context) => {
          const val = await startDateInput(context).inputValue()
          expect(val, is(stringWithLength(10)))
        }),
        effect("return date has the same value as start date", async (context) => {
          const startDate = await startDateInput(context).inputValue()
          const returnDate = await returnDateInput(context).inputValue()
          expect(returnDate, is(startDate))
        }),
        theReturnDateIsDisabled()
      ]
    }),

  example(flightBookerApp)
    .description("Book a one-way flight")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a one way flight", async (context) => {
          await flightSelector(context).select("one-way flight")
        }),
        step("enter a date in the future", async (context) => {
          await startDateInput(context).type(dateInTheFuture(2))
        }),
        step("click to book", async (context) => {
          await bookFlightButton(context).click()
        })
      ],
      observe: [
        effect("an alert is displayed with the booked flight info", async (context) => {
          expect(context.lastAlert?.message, is(assignedWith(satisfying([
            stringContaining("one-way flight"),
            stringContaining(dateInTheFuture(2))
          ]))))
        }),
        theReturnDateIsDisabled()
      ]
    }),

  example(flightBookerApp)
    .description("Book a return flight")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a return flight", async (context) => {
          await flightSelector(context).select("return flight")
        }),
        step("enter a date in the future", async (context) => {
          await startDateInput(context).type(dateInTheFuture(3))
        }),
        step("enter an end date after the start date", async (context) => {
          await returnDateInput(context).type(dateInTheFuture(5))
        }),
        step("click to book", async (context) => {
          await bookFlightButton(context).click()
        })
      ],
      observe: [
        effect("an alert is displayed with the booked flight info", async (context) => {
          expect(context.lastAlert?.message, is(assignedWith(satisfying([
            stringContaining("return flight"),
            stringContaining(dateInTheFuture(3)),
            stringContaining(dateInTheFuture(5))
          ]))))
        })
      ]
    }),

  example(flightBookerApp)
    .description("Book a same-day return flight")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a return flight", async (context) => {
          await flightSelector(context).select("return flight")
        }),
        step("enter a date in the future", async (context) => {
          await startDateInput(context).type(dateInTheFuture(3))
        }),
        step("enter an end date on the same day as the start date", async (context) => {
          await returnDateInput(context).type(dateInTheFuture(3))
        }),
        step("click to book", async (context) => {
          await bookFlightButton(context).click()
        })
      ],
      observe: [
        effect("an alert is displayed with the booked flight info", async (context) => {
          expect(context.lastAlert?.message, is(assignedWith(satisfying([
            stringContaining("return flight"),
            stringContaining(dateInTheFuture(3)),
            stringContaining(dateInTheFuture(3))
          ]))))
        })
      ]
    }),

  example(flightBookerApp)
    .description("attempt to book a return flight earlier than the start")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a return flight", async (context) => {
          await flightSelector(context).select("return flight")
        }),
        step("enter a date in the future", async (context) => {
          await startDateInput(context).type(dateInTheFuture(3))
        }),
        step("enter an end date before the start date", async (context) => {
          await returnDateInput(context).type(dateInTheFuture(1))
        })
      ],
      observe: [
        theBookingButtonIsDisabled()
      ]
    }),

  example(flightBookerApp)
    .description("enter a badly formatted start date")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a one-way flight", async (context) => {
          await flightSelector(context).select(FlightTypes.ONE_WAY)
        }),
        step("enter a bad start date", async (context) => {
          await startDateInput(context).type("blah")
        })
      ],
      observe: [
        theBookingButtonIsDisabled(),
        theInputFieldIsInvalid("start date", startDateInput),
        effect("the start date contains the bad date", async (context) => {
          await expect(startDateInput(context).inputValue(), resolvesTo("blah"))
        })
      ]
    }),

  example(flightBookerApp)
    .description("enter a badly formatted return date")
    .script({
      suppose: [
        fact("the flight booker is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("select a one-way flight", async (context) => {
          await flightSelector(context).select(FlightTypes.RETURN)
        }),
        step("enter a bad start date", async (context) => {
          await returnDateInput(context).type("blerg")
        })
      ],
      observe: [
        theBookingButtonIsDisabled(),
        theInputFieldIsInvalid("return date", returnDateInput),
        effect("the return date contains the bad date", async (context) => {
          await expect(returnDateInput(context).inputValue(), resolvesTo("blerg"))
        })
      ]
    })

])

function theInputFieldIsInvalid(name: string, elementGenerator: (context: FlightBookerTestApp) => DisplayElement): Observation<FlightBookerTestApp> {
  return effect(`the ${name} is shown to be invalid`, async (context) => {
    await expect(elementGenerator(context).classNames(), resolvesTo(stringContaining("bg-fuchsia-400")))
  })
}

function theReturnDateIsDisabled(): Observation<FlightBookerTestApp> {
  return effect("return date is disabled", async (context) => {
    const isDisabled = await returnDateInput(context).isDisabled()
    expect(isDisabled, is(true))
  })
}

function theBookingButtonIsDisabled(): Observation<FlightBookerTestApp> {
  return effect("the booking button is disabled", async (context) => {
    await expect(bookFlightButton(context).isDisabled(), resolvesTo(true))
  })
}

function dateInTheFuture(days: number): string {
  return DateTime.now().plus({ days }).toFormat("dd.MM.yyyy")
}

function startDateInput(context: FlightBookerTestApp): DisplayElement {
  return context.display.selectElement("[data-start-date]")
}

function returnDateInput(context: FlightBookerTestApp): DisplayElement {
  return context.display.selectElement("[data-return-date]")
}

function flightSelector(context: FlightBookerTestApp): DisplayElement {
  return context.display.selectElement("select")
}

function bookFlightButton(context: FlightBookerTestApp): DisplayElement {
  return context.display.selectElement("button")
}