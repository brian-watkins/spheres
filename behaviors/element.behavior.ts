import { behavior, effect, example, fact, Observation } from "esbehavior";
import { TestApp, testAppContext } from "./helpers/testApp";
import * as Html from "../src/display"
import { equalTo, expect, is } from "great-expectations";

const viewWithElements =
  Html.div([], [
    Html.h1([], []),
    Html.article([], []),
    Html.p([], []),
    Html.ul([], [
      Html.li([], [ Html.text("hello") ])
    ]),
    Html.button([], [ Html.text("Click it!") ])
  ])

export default behavior("View Elements", [
  example(testAppContext())
    .description("basic view element support")
    .script({
      suppose: [
        fact("there is a view with all the elements", (context) => {
          context.setView(viewWithElements)
          context.start()
        })
      ],
      observe: [
        theElementExists("DIV"),
        theElementExists("ARTICLE"),
        theElementExists("P"),
        theElementExists("H1"),
        theElementExists("UL"),
        theElementExists("LI"),
        theElementExists("BUTTON")
      ]
    })
])

function theElementExists(tag: string): Observation<TestApp<unknown>> {
  return effect(`there is a ${tag} element`, (context) => {
    const hasElement = context.display.hasElementMatching(tag)
    expect(hasElement, is(equalTo(true)))
  })
}