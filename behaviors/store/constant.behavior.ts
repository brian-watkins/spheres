import { constant } from "@src/constant";
import { container, derived } from "@src/index";
import { Container, DerivedState } from "@src/store";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

interface ConstantStateContext {
  dependency: Container<string>
  state: DerivedState<string>
}

export default behavior("constant state", [

  example(testStoreContext<ConstantStateContext>())
    .description("derived state that depends on constant state")
    .script({
      suppose: [
        fact("there is derived state that depends on a constant", (context) => {
          const dependency = container({ initialValue: "Hello" })
          const nameState = constant({ initialValue: "Cool Dude" })
          const state = derived({ query: get => `${get(dependency)} ${get(nameState)}!` })
          context.setTokens({
            dependency,
            state
          })
        }),
        fact("there is a subscriber to the derived state", (context) => {
          context.subscribeTo(context.tokens.state, "sub-1")
        })
      ],
      perform: [
        step("the state updates", (context) => {
          context.writeTo(context.tokens.dependency, "You are cool,")
          context.writeTo(context.tokens.dependency, "See ya")
        })
      ],
      observe: [
        effect("the subscriber receives the updates", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Hello Cool Dude!",
            "You are cool, Cool Dude!",
            "See ya Cool Dude!"
          ]))
        })
      ]
    })

])