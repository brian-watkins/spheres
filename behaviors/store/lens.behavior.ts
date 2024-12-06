import { Container, container, lens, State } from "@src/index";
import { Variable } from "@src/store";
import { variable } from "@src/variable";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

export default behavior("lens", [

  example(testStoreContext<State<string>>())
    .description("basic lens")
    .script({
      suppose: [
        fact("there is a lens", (context) => {
          const token = lens(container({ initialValue: "hello" })).focus()
          context.setTokens(token)
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens, "sub-1")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "hello"
          ]))
        })
      ]
    }),

  example(testStoreContext<State<string>>())
    .description("basic lens with map")
    .script({
      suppose: [
        fact("there is a lens with a map function", (context) => {
          const token = lens(container({ initialValue: "hello" }))
            .map(value => `${value}!!`)
            .focus()

          context.setTokens(token)
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens, "sub-1")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "hello!!"
          ]))
        })
      ]
    }),

  example(testStoreContext<LensOfLensContext>())
    .description("lens of lens")
    .script({
      suppose: [
        fact("there is a lens of a container that holds a container", (context) => {
          const innerContainer = container({ name: "inner-container", initialValue: "Sup" })
          const wrapperContainer = container({ name: "wrapper-container", initialValue: innerContainer })
          const token = lens(wrapperContainer)
            .andThen(lens)
            .focus()

          context.setTokens({
            lens: token,
            innerContainer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-1")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Sup"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the inner container", (context) => {
          context.writeTo(context.tokens.innerContainer, "What? What?")
        })
      ],
      observe: [
        effect("the lens subscriber gets the updated value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Sup",
            "What? What?"
          ]))
        })
      ]
    }),

  example(testStoreContext<VariableLensContext<string>>())
    .description("lens based on variable")
    .script({
      suppose: [
        fact("there is a lens based on a variable", (context) => {
          const variableState = variable({
            initialValue: "hello"
          })
          context.setTokens({
            variableState,
            lens: lens(variableState).focus()
          })
        }),
        fact("there is a subscriber to the state", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-1")
        })
      ],
      perform: [
        step("the variable is replaced", (context) => {
          context.tokens.variableState.assignValue("next!")
        }),
        step("another subscriber", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-2")
        })
      ],
      observe: [
        effect("the first subscriber sees the first variable only", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "hello"
          ]))
        }),
        effect("the second subscriber sees the updated variable only", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            "next!"
          ]))
        })
      ]
    }),

  example(testStoreContext<ObjectLensContext>())
    .description("lens updates only when value changes")
    .script({
      suppose: [
        fact("there is a lens focused on a property of an object", (context) => {
          const root = container({
            initialValue: {
              name: "Cool Dude",
              title: "Executive"
            }
          })

          context.setTokens({
            root,
            lens: lens(root).map(value => value.name).focus()
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-1")
        })
      ],
      perform: [
        step("the root object is updated but not the focused property", (context) => {
          context.writeTo(context.tokens.root, { name: "Cool Dude", title: "Gardener" })
        }),
        step("the root object is updated and the focused property changes", (context) => {
          context.writeTo(context.tokens.root, { name: "Awesome Person", title: "Gardener" })
        })
      ],
      observe: [
        effect("the subscriber only receives an update when the focused value changes", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Cool Dude",
            "Awesome Person"
          ]))
        })
      ]
    }),

  example(testStoreContext<VariableLensContext<Container<string>>>())
    .description("lens of lens based on variable")
    .script({
      suppose: [
        fact("there is a lens with a variable for a root", (context) => {
          const variableState = variable({ initialValue: container({ initialValue: "Yo" }) })
          context.setTokens({
            variableState,
            lens: lens(variableState)
              .andThen(lens)
              .map(val => val.length)
              .map(val => `${val} letters`)
              .focus()
          })
        })
      ],
      perform: [
        step("first subscriber", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-1")
        }),
        step("the variable updates", (context) => {
          context.tokens.extra = container({ initialValue: "extra" })
          context.tokens.variableState.assignValue(context.tokens.extra)
        }),
        step("another subscriber", (context) => {
          context.subscribeTo(context.tokens.lens, "sub-2")
        }),
        step("the variable state updates", (context) => {
          context.writeTo(context.tokens.extra!, "fun!")
        }),
        step("the variable state updates again but the focused value does not change", (context) => {
          context.writeTo(context.tokens.extra!, "four")
        }),
        step("the variable state updates again", (context) => {
          context.writeTo(context.tokens.extra!, "Hi")
        }),
        step("the variable state updates again", (context) => {
          context.writeTo(context.tokens.extra!, "Hii")
        }),
        step("the variable state updates again", (context) => {
          context.writeTo(context.tokens.extra!, "yes")
        }),
      ],
      observe: [
        effect("the first subscriber sees the first variable only", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "2 letters"
          ]))
        }),
        effect("the second subscriber sees the updated variable and then the updated state", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            "5 letters",
            "4 letters",
            "2 letters",
            "3 letters",
          ]))
        })
      ]
    })

])

interface LensOfLensContext {
  lens: State<string>
  innerContainer: Container<string>
}

interface VariableLensContext<T> {
  variableState: Variable<T>
  lens: State<string>
  extra?: Container<string>
}

interface TestObject {
  name: string
  title: string
}

interface ObjectLensContext {
  root: Container<TestObject>
  lens: State<string>
}