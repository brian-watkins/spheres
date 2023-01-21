import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is, stringContaining } from "great-expectations";
import { Display } from "../src/display";
import { derive, root, Root, State } from "../src/state";
import * as View from "../src/view"
import { TestDisplay } from "./helpers/testDisplay";


class TestApp<S> {
  private view: View.View | undefined
  private stateDescription: S | undefined
  private appDisplay: Display | undefined

  setState(stateDescription: S) {
    this.stateDescription = stateDescription
  }

  get state(): S {
    return this.stateDescription!
  }

  setView(view: View.View) {
    this.view = view
  }

  start() {
    this.appDisplay = new Display(this.view!)
    this.appDisplay.mount(document.querySelector("#test-display")!)
  }

  destroy() {
    if (this.appDisplay) {
      this.appDisplay.destroy()
      this.appDisplay = undefined
    }
  }

  get display(): TestDisplay {
    return new TestDisplay()
  }
}

function testAppContext<T>(): Context<TestApp<T>> {
  return {
    init: () => new TestApp<T>(),
    teardown: (testApp) => testApp.destroy()
  }
}

interface TestData {
  peopleState: Root<Array<{ name: string, age: number }>>
  peopleView: State<View.View>
}

const simpleViewBehavior =
  example(testAppContext<TestData>())
    .description("Rendering a simple view")
    .script({
      suppose: [
        fact("some data is provided for the view", (testApp) => {
          const peopleState = root([
            { name: "Cool Dude", age: 41 },
            { name: "Awesome Person", age: 28 }
          ])
          const peopleView = derive((get) => {
            const people = get(peopleState)
            return View.ul([], people.map(person => {
              return View.li([View.data("person")], [
                `${person.name} - ${person.age}`
              ])
            }))
          })
          testApp.setState({
            peopleState,
            peopleView
          })
        }),
        fact("the view is rendered", (testApp) => {
          const view = View.div([], [
            View.p([], [
              "Here is some text"
            ]),
            View.viewGenerator(testApp.state.peopleView)
          ])

          testApp.setView(view)
          testApp.start()
        })
      ],
      observe: [
        effect("the data is rendered on the screen", async (testApp) => {
          const texts = testApp.display.elementsMatching("[data-person]").map((element) => element.text())
          expect(texts, is(equalTo([
            "Cool Dude - 41",
            "Awesome Person - 28"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (testApp) => {
          testApp.state.peopleState.write([
            { name: "Fun Person", age: 99 }
          ])
        })
      ],
      observe: [
        effect("the updated view is rendered", async (testApp) => {
          const texts = testApp.display.elementsMatching("[data-person]").map((element) => element.text())
          expect(texts, is(equalTo([
            "Fun Person - 99",
          ])))
        })
      ]
    })

interface TestDataMulti {
  name: Root<string>
  age: Root<number>
  nameView: State<View.View>,
  ageView: State<View.View>
}

const multipleViewsBehavior =
  example(testAppContext<TestDataMulti>())
    .description("multiple views")
    .script({
      suppose: [
        fact("some state is provided for the view", (testApp) => {
          const nameState = root("hello")
          const ageState = root(27)
          testApp.setState({
            name: nameState,
            age: ageState,
            nameView: derive((get) => {
              return View.p([View.data("name")], [
                `My name is: ${get(nameState)}`
              ])
            }),
            ageView: derive((get) => {
              return View.p([View.data("age")], [
                `My age is: ${get(ageState)}`
              ])
            })
          })
        }),
        fact("the view is rendered", (testApp) => {
          const view = View.div([], [
            View.h1([], ["This is only a test!"]),
            View.viewGenerator(testApp.state.nameView),
            View.viewGenerator(testApp.state.ageView)
          ])

          testApp.setView(view)
          testApp.start()
        })
      ],
      observe: [
        effect("it displays the name and age", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("hello")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    }).andThen({
      perform: [
        step("the name state is update", (testApp) => {
          testApp.state.name.write("Cool Dude")
        })
      ],
      observe: [
        effect("the updated name is displayed", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("Cool Dude")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    })

const nestedViewsBehavior =
  example(testAppContext<TestDataMulti>())
    .description("nested views")
    .script({
      suppose: [
        fact("some state is provided for the view", (testApp) => {
          const nameState = root("hello")
          const ageState = root(27)
          const ageView = derive((get) => {
            return View.p([View.data("age")], [
              `My age is: ${get(ageState)}`
            ])
          })
          testApp.setState({
            name: nameState,
            age: ageState,
            nameView: derive((get) => {
              const name = get(nameState)
              let children = [
                View.p([View.data("name")], [
                  `My name is: ${name}`
                ])
              ]
              if (name !== "AGELESS PERSON") {
                children.push(View.viewGenerator(ageView))
              }
              return View.div([], children)
            }),
            ageView
          })
        }),
        fact("the view is rendered", (testApp) => {
          const view = View.div([], [
            View.h1([], ["This is only a test!"]),
            View.viewGenerator(testApp.state.nameView),
          ])

          testApp.setView(view)
          testApp.start()
        })
      ],
      observe: [
        effect("it displays the name and age", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("hello")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the name state is updated", (testApp) => {
          testApp.state.name.write("Fun Person")
        })
      ],
      observe: [
        effect("the updated name is displayed", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("Fun Person")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("27")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the age state is updated with the name", (testApp) => {
          testApp.state.name.write("Happy Person")
          testApp.state.age.write(33)
        })
      ],
      observe: [
        effect("the updated name is displayed", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("Happy Person")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("33")))
        })
      ]
    })
    .andThen({
      perform: [
        step("the nested view is removed", (testApp) => {
          testApp.state.name.write("AGELESS PERSON")
        })
      ],
      observe: [
        effect("the age is not present", (testApp) => {
          const ageIsVisible = testApp.display.hasElementMatching("[data-age]")
          expect(ageIsVisible, is(equalTo(false)))
        })
      ]
    })
    .andThen({
      perform: [
        step("the nested view is recreated", (testApp) => {
          testApp.state.name.write("FUNNY PERSON")
          testApp.state.age.write(81)
        })
      ],
      observe: [
        effect("the age is present once again", (testApp) => {
          const nameText = testApp.display.elementMatching("[data-name]").text()
          expect(nameText, is(stringContaining("FUNNY PERSON")))

          const ageText = testApp.display.elementMatching("[data-age]").text()
          expect(ageText, is(stringContaining("81")))
        })
      ]
    })


export default behavior("view", [
  simpleViewBehavior,
  multipleViewsBehavior,
  nestedViewsBehavior,
])