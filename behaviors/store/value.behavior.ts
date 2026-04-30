import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore.js";
import { container, Container, Value, valueAt } from "@store/index.js";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";


interface ValueContext {
  id: string
  name: Value<string>
  age: Value<number>
}

export default behavior("value", [

  example(testStoreContext<Container<ValueContext>>())
    .description("value in a container")
    .script({
      suppose: [
        fact("there is a container with values", (context) => {
          context.setTokens(container(value => ({
            initialValue: {
              id: "my-id",
              name: value("Cool Dude"),
              age: value(38)
            }
          })))
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens, "sub-1")
        }),
        fact("there is a subscriber to the value", (context) => {
          context.subscribeTo(valueAt(context.tokens, $ => $.name), "name-sub")
        }),
        fact("there is a subscriber to the other value", (context) => {
          context.subscribeTo(valueAt(context.tokens, $ => $.age), "age-sub")
        })
      ],
      observe: [
        effect("the container subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is(arrayWith([
            objectWithProperty("id", equalTo("my-id"))
          ])))
        }),
        effect("the value subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is([
            "Cool Dude"
          ]))
        }),
        effect("the age subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("age-sub"), is([
            38
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the value is updated", (context) => {
          context.writeTo(valueAt(context.tokens, $ => $.name), "Awesome Person")
        })
      ],
      observe: [
        effect("the container subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is(arrayWith([
            objectWithProperty("id", equalTo("my-id"))
          ])))
        }),
        effect("the value subscriber gets the update", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is([
            "Cool Dude",
            "Awesome Person"
          ]))
        }),
        effect("the age subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("age-sub"), is([
            38
          ]))
        })
      ]
    })

])