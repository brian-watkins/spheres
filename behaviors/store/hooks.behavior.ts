import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { Container, container, State, useHooks } from "@store/index";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";

interface OnRegisterContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
  registeredContainers: Array<State<any>>
}

export default behavior("store hooks", [

  example(testStoreContext<OnRegisterContext>())
    .description("onRegister hook")
    .script({
      suppose: [
        fact("there is an onRegister hook", (context) => {
          context.setTokens({
            stringContainer: container({ name: "string-container", initialValue: "hello" }),
            numberContainer: container({ name: "number-container", initialValue: 27 }),
            registeredContainers: []
          })
          context.tokens.registeredContainers = []
          useHooks(context.store, {
            onRegister(container) {
              context.tokens.registeredContainers.push(container)
            },
          })
        })
      ],
      perform: [
        step("containers are registered with the store", (context) => {
          context.subscribeTo(context.tokens.stringContainer, "string-sub")
          context.subscribeTo(context.tokens.numberContainer, "number-sub")
        })
      ],
      observe: [
        effect("the onRegister hook is called with each container", (context) => {
          expect(context.tokens.registeredContainers, is(arrayWith([
            objectWithProperty("name", equalTo("string-container")),
            objectWithProperty("name", equalTo("number-container"))
          ])))
        }),
        effect("subscribers receive the initial value", (context) => {
          expect(context.valuesForSubscriber("string-sub"), is([
            "hello"
          ]))
          expect(context.valuesForSubscriber("number-sub"), is([
            27
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a container is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "Yo!")
        })
      ],
      observe: [
        effect("the subscriber is updated", (context) => {
          expect(context.valuesForSubscriber("string-sub"), is([
            "hello",
            "Yo!"
          ]))
        })
      ]
    })

])