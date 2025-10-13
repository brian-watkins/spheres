import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { entity, Entity, write } from "@store/index";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";

interface Item {
  name: string
  label: { type: string, content: string }
  count: number
}

export default behavior("entity state", [

  example(testStoreContext<Entity<Item>>())
    .description("subscribe to entity property")
    .script({
      suppose: [
        fact("there is an entity", (context) => {
          context.setTokens(entity({
            initialValue: {
              name: "Mr. Cool",
              label: { type: "a", content: "fun" },
              count: 14
            }
          }))
        }),
        fact("there is a subscriber to the token", (context) => {
          context.subscribeTo(context.tokens, "all-sub")
        }),
        fact("there is a subscriber to a nested property", (context) => {
          context.subscribeTo(context.tokens.label.content, "label-content-sub")
        }),
        fact("there is a subscriber to another property", (context) => {
          context.subscribeTo(context.tokens.count, "count-sub")
        })
      ],
      observe: [
        effect("the all subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("all-sub"), is([
            {
              name: "Mr. Cool",
              label: { type: "a", content: "fun" },
              count: 14
            }
          ]))
        }),
        effect("the content subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("label-content-sub"), is([
            "fun"
          ]))
        }),
        effect("the count subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("count-sub"), is([
            14
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the content prop only", (context) => {
          context.store.dispatch(write(context.tokens.label.content, "happy"))
        })
      ],
      observe: [
        effect("the all subscriber updates", (context) => {
          expect(context.valuesForSubscriber("all-sub"), is([
            {
              name: "Mr. Cool",
              label: { type: "a", content: "fun" },
              count: 14
            },
            {
              name: "Mr. Cool",
              label: { type: "a", content: "happy" },
              count: 14
            }
          ]))
        }),
        effect("the content subscriber updates", (context) => {
          expect(context.valuesForSubscriber("label-content-sub"), is([
            "fun",
            "happy"
          ]))
        }),
        effect("the count subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("count-sub"), is([
            14
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the content prop again", (context) => {
          context.store.dispatch(write(context.tokens.label.content, "happier!"))
        })
      ],
      observe: [
        effect("the all subscriber updates", (context) => {
          expect(context.valuesForSubscriber("all-sub"), is(arrayWith([
            objectWithProperty("label", objectWithProperty("content", equalTo("fun"))),
            objectWithProperty("label", objectWithProperty("content", equalTo("happy"))),
            objectWithProperty("label", objectWithProperty("content", equalTo("happier!")))
          ])))
        }),
        effect("the content subscriber updates", (context) => {
          expect(context.valuesForSubscriber("label-content-sub"), is([
            "fun",
            "happy",
            "happier!"
          ]))
        }),
        effect("the count subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("count-sub"), is([
            14
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the count prop only", (context) => {
          context.store.dispatch(write(context.tokens.count, 27))
        })
      ],
      observe: [
        effect("the all subscriber updates", (context) => {
          expect(context.valuesForSubscriber("all-sub"), is(arrayWith([
            objectWithProperty("count", equalTo(14)),
            objectWithProperty("count", equalTo(14)),
            objectWithProperty("count", equalTo(14)),
            objectWithProperty("count", equalTo(27))
          ])))
        }),
        effect("the content subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("label-content-sub"), is([
            "fun",
            "happy",
            "happier!"
          ]))
        }),
        effect("the count subscriber updates", (context) => {
          expect(context.valuesForSubscriber("count-sub"), is([
            14,
            27
          ]))
        })
      ]
    })

])

