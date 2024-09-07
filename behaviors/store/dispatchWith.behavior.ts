import { container, Container, write } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

export default behavior("dispatchWith", [
  
  example(testStoreContext())
    .description("dispatchWith dispatcher returns undefined")
    .script({
      observe: [
        effect("no exception is thrown when dispatcher returns undefined", (context) => {
          context.store.dispatchWith(() => undefined)
        })
      ],
    }),

  example(testStoreContext<DispatchWithContext>())
    .description("dispatchWith dispatcher returns a message based on state")
    .script({
      suppose: [
        fact("there is some existing state", (context) => {
          context.setTokens({
            message: container({ initialValue: "Hello!" }),
            name: container({ initialValue: "Cool Dude" })
          })
        }),
        fact("there is a subscriber to the message token", (context) => {
          context.subscribeTo(context.tokens.message, "sub-1")
        })
      ],
      observe: [
        effect("the subscriber receives the initial message value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Hello!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the message is updated based on the name", (context) => {
          context.store.dispatchWith((get) => {
            return write(context.tokens.message, `Your name is: ${get(context.tokens.name)}`)
          })
        })
      ],
      observe: [
        effect("the subscriber receives the updated message", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Hello!",
            "Your name is: Cool Dude"
          ]))
        })
      ]
    })

])

interface DispatchWithContext {
  message: Container<string>,
  name: Container<string>
}