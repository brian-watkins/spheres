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

  example(testStoreContext<GlitchContainerContext>())
    .description("a container with a constraint that depends on multiple state tokens updated in sequence")
    .script({
      suppose: [
        fact("there is a container with a constraint", (context) => {
          const root = container({ initialValue: "root" })
          const first = derived({
            query: (get) => `${get(root)} + first`
          })
          const second = derived({
            query: (get) => `${get(root)} + second`
          })
          const third = container({
            initialValue: "third"
          })
          const constrainedContainer = container({
            initialValue: "initial",
            constraint: ({ get, current }, next) => {
              if (next === "COOL" || current.includes("COOL")) {
                return `${get(first)} & ${get(third)} with ${next ?? current.split(" ")[0]}`
              }
              return `${get(first)} & ${get(second)} with ${next ?? current.split(" ")[0]}`
            }
          })
          let writerCalls: Array<string> = []
          context.useContainerHooks(constrainedContainer, {
            onWrite(message, actions) {
              writerCalls.push(message)
              actions.ok(message)
            },
          })
          context.setTokens({
            rootContainer: root,
            constrainedContainer,
            thirdContainer: third,
            writerCalls
          })
        }),
      ],
      perform: [
        step("the root container is updated", (context) => {
          context.writeTo(context.tokens.rootContainer, "AWESOME")
        })
      ],
      observe: [
        effect("the onWrite hook is called only once", (context) => {
          expect(context.tokens.writerCalls, is([
            "AWESOME + first & AWESOME + second with root"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a message is written to the container which invokes a new dependency", (context) => {
          context.writeTo(context.tokens.constrainedContainer, "COOL")
        })
      ],
      observe: [
        effect("the onWrite hook is called with the new constrained message", (context) => {
          expect(context.tokens.writerCalls, is([
            "AWESOME + first & AWESOME + second with root",
            "AWESOME + first & third with COOL"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the newly tracked dependency", (context) => {
          context.writeTo(context.tokens.thirdContainer, "THIRD!!")
        })
      ],
      observe: [
        effect("the onWrite hook is called with the new constrained message", (context) => {
          expect(context.tokens.writerCalls, is([
            "AWESOME + first & AWESOME + second with root",
            "AWESOME + first & third with COOL",
            "AWESOME + first & THIRD!! with AWESOME"
          ]))
        })
      ]
    })

])

interface GlitchContainerContext {
  rootContainer: Container<string>
  writerCalls: Array<string>
  thirdContainer: Container<string>
  constrainedContainer: Container<string>
}

interface GlitchCommandContext {
  rootContainer: Container<string>
  commandMessages: Array<string>
}

interface GlitchEffectContext {
  rootContainer: Container<string>
  thirdDerived: DerivedState<string>
}