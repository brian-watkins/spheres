import { Container, DerivedState, command, container, derived } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

export default behavior("glitch-free effects", [

  example(testStoreContext<GlitchEffectContext>())
    .description("an effect that depends on multiple state tokens that update in sequence")
    .script({
      suppose: [
        fact("there is a root container and several dependencies", (context) => {
          const root = container({ initialValue: "root" })
          const first = derived({
            query: (get) => `${get(root)} + first`
          })
          const second = derived({
            query: (get) => `${get(root)} + second`
          })
          context.setTokens({
            rootContainer: root,
            thirdDerived: derived({
              query: (get) => `${get(first)} & ${get(second)}`
            })
          })
        }),
        fact("there is an effect that observes the derived state", (context) => {
          context.subscribeTo(context.tokens.thirdDerived, "sub")
        })
      ],
      perform: [
        step("the root container is updated", (context) => {
          context.writeTo(context.tokens.rootContainer, "primary")
        })
      ],
      observe: [
        effect("the effect is called on the initial value and only one update", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "root + first & root + second",
            "primary + first & primary + second"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchCommandContext>())
    .description("a command that is triggered by a query with multiple tokens updated in sequence")
    .script({
      suppose: [
        fact("there is a command with a query", (context) => {
          const root = container({ initialValue: "root" })
          const first = derived({
            query: (get) => `${get(root)} + first`
          })
          const second = derived({
            query: (get) => `${get(root)} + second`
          })
          const myCommand = command({
            trigger: (get) => `${get(first)} & ${get(second)}`
          })
          let commandMessages: Array<string> = []
          context.useCommand(myCommand, (message) => {
            commandMessages.push(message)
          })
          context.setTokens({
            rootContainer: root,
            commandMessages
          })
        })
      ],
      perform: [
        step("the root container is updated, triggering the command", (context) => {
          context.writeTo(context.tokens.rootContainer, "FUN")
        })
      ],
      observe: [
        effect("the command is triggered with the initial message and then only once", (context) => {
          expect(context.tokens.commandMessages, is([
            "root + first & root + second",
            "FUN + first & FUN + second"
          ]))
        })
      ]
    }),

])

interface GlitchCommandContext {
  rootContainer: Container<string>
  commandMessages: Array<string>
}

interface GlitchEffectContext {
  rootContainer: Container<string>
  thirdDerived: DerivedState<string>
}