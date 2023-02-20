import { behavior, effect, example, fact, step } from "esbehavior";
import { container, state, withDerivedValue, withInitialValue } from "@src/index.js";
import { Container, State } from "@src/loop.js";
import { testAppContext } from "./helpers/testApp.js";
import * as Html from "@src/display/index.js"
import { equalTo, expect, is } from "great-expectations";

interface CssAppState {
  numberState: Container<number>
  funView: State<Html.View>
}

export default behavior("css attributes on view", [
  example(testAppContext<CssAppState>())
    .description("View with dynamic css attributes")
    .script({
      suppose: [
        fact("there is a view with local state", (context) => {
          const numberState = container(withInitialValue(17))
          const funView = state(withDerivedValue((get) => {
            return Html.div([
              Html.id("cool-stuff"),
              Html.cssClasses([
                "zoom",
                get(numberState) % 2 == 0 ? "even" : "odd"
              ])
            ],
            [ Html.text("This is some cool stuff!")
            ])
          }))
          context.setState({
            numberState,
            funView
          })
        }),
        fact("the view is rendered", (context) => {
          const view = Html.div([], [
            Html.h1([], ["This is only a test!"]),
            Html.viewGenerator(context.state.funView),
          ])

          context.setView(view)
          context.start()
        })
      ],
      observe: [
        effect("only one css class is present based on the state", (context) => {
          const classes = context.display.elementMatching("#cool-stuff").classes()
          expect(classes, is(equalTo([
            "zoom",
            "odd"
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("the state is updated", (context) => {
          context.updateState(context.state.numberState, 24)
        })
      ],
      observe: [
        effect("the css class list is updated", (context) => {
          const classes = context.display.elementMatching("#cool-stuff").classes()
          expect(classes, is(equalTo([
            "zoom",
            "even"
          ])))
        })
      ]
    })
])