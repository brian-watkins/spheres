import { behavior, effect, example, fact, step } from "esbehavior";
import { derive, container, setState, State } from "../src/state";
import { testAppContext } from "./helpers/testApp";
import * as View from "../src/view"
import { expect, is, stringContaining } from "great-expectations";

interface ClickCounterState {
  clickCounterView: State<View.View>
}

export default behavior("view events", [
  example(testAppContext<ClickCounterState>())
    .description("counting clicks with local state")
    .script({
      suppose: [
        fact("there is a view that depends on click count", (context) => {
          context.setState((loop) => {
            const clickCount = container(loop, 0)

            const clickCounterView = derive(loop, (get) => {
              return View.div([], [
                View.button([
                  View.onClick(setState(clickCount, get(clickCount) + 1))
                ], [ "Click me!" ]),
                View.p([View.data("click-count")], [
                  `You've clicked the button ${get(clickCount)} times!`
                ])
              ])
            })

            return {
              clickCounterView
            }
          })

          context.setView(View.div([], [
            View.h1([], ["This is the click counter!"]),
            View.viewGenerator(context.state.clickCounterView)
          ]))

          context.start()
        })
      ],
      perform: [
        step("the button is clicked three times", (context) => {
          context.display.elementMatching("button").click()
          context.display.elementMatching("button").click()
          context.display.elementMatching("button").click()
        })
      ],
      observe: [
        effect("the click counter is updated", (context) => {
          const counterText = context.display.elementMatching("[data-click-count]").text()
          expect(counterText, is(stringContaining("3 times")))
        })
      ]
    })
])