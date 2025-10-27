import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { derived, entity, Entity, update, write } from "@store/index";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";

interface Item {
  name: string
  label: { type: string, content: string }
  count: number
}

export default behavior("entity state", [

  example(testStoreContext<Entity<Item>>())
    .description("entity object")
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
    }),

  (m) => m.pick() && example(testStoreContext<Entity<Array<Item>>>())
    .description("entity array")
    .script({
      suppose: [
        fact("there is an entity", (context) => {
          context.setTokens(entity({
            initialValue: [
              {
                name: "Mr. Cool",
                label: { type: "a", content: "boat" },
                count: 14
              },
              {
                name: "Ms. Fun",
                label: { type: "b", content: "bike" },
                count: 6
              },
              {
                name: "Dr. Awesome",
                label: { type: "b", content: "car" },
                count: 83
              }
            ]
          }))
        }),
        fact("there is a subscriber to an item", (context) => {
          context.subscribeTo(context.tokens[0].name, "name-sub-1")
        }),
        fact("there is a subscriber to another item", (context) => {
          context.subscribeTo(context.tokens[2].name, "name-sub-2")
        }),
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("name-sub-1"), is([
            "Mr. Cool"
          ]))
        }),
        effect("the other subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("name-sub-2"), is([
            "Dr. Awesome"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update one of the items", (context) => {
          context.writeTo(context.tokens[2].name, "Ms. Great")
        })
      ],
      observe: [
        effect("the other subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("name-sub-1"), is([
            "Mr. Cool"
          ]))
        }),
        effect("the subscriber to the changed value updates", (context) => {
          expect(context.valuesForSubscriber("name-sub-2"), is([
            "Dr. Awesome",
            "Ms. Great"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the array", (context) => {
          //@ts-ignore
          context.store.dispatch(update(context.tokens, (list) => [list[1], list[2], list[0]]))
        })
      ],
      observe: [
        effect("the subscribers update", (context) => {
          expect(context.valuesForSubscriber("name-sub-1"), is([
            "Mr. Cool",
            "Ms. Fun"
          ]))
          expect(context.valuesForSubscriber("name-sub-2"), is([
            "Dr. Awesome",
            "Ms. Great",
            "Mr. Cool"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update the array, but not items 0 or 2", (context) => {
          //@ts-ignore
          context.store.dispatch(update(context.tokens, (list) => [
            list[0],
            {
              name: "Mr. Cool",
              label: { type: "a", content: "boat" },
              count: 14
            },
            list[2]
          ]))
        })
      ],
      observe: [
        effect("the subscribers do not update", (context) => {
          expect(context.valuesForSubscriber("name-sub-1"), is([
            "Mr. Cool",
            "Ms. Fun"
          ]))
          expect(context.valuesForSubscriber("name-sub-2"), is([
            "Dr. Awesome",
            "Ms. Great",
            "Mr. Cool"
          ]))
        })
      ]
    }),

  example(testStoreContext<Entity<Array<Item>>>())
    .description("entity array reference in derived state")
    .script({
      suppose: [
        fact("there is an entity", (context) => {
          context.setTokens(entity({
            initialValue: [
              {
                name: "Mr. Cool",
                label: { type: "a", content: "boat" },
                count: 14
              },
              {
                name: "Ms. Fun",
                label: { type: "b", content: "bike" },
                count: 6
              },
              {
                name: "Dr. Awesome",
                label: { type: "b", content: "car" },
                count: 83
              }
            ]
          }))
        }),
        fact("there is derived state that references the entity", (context) => {
          const secondLabelState = derived(get => `derived: ${get(context.tokens[1].label.content)}`)
          context.subscribeTo(secondLabelState, "derived-state-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the iniial derived value", (context) => {
          expect(context.valuesForSubscriber("derived-state-sub"), is([
            "derived: bike"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("update a different item", (context) => {
          context.writeTo(context.tokens[0].label.content, "submarine")
        })
      ],
      observe: [
        effect("the subscriber does not update", (context) => {
          expect(context.valuesForSubscriber("derived-state-sub"), is([
            "derived: bike"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the array is updated", (context) => {
          //@ts-ignore
          context.store.dispatch(update(context.tokens, (list) => [list[2], list[0], list[1]]))
        })
      ],
      observe: [
        effect("the subscriber updates with the new value", (context) => {
          expect(context.valuesForSubscriber("derived-state-sub"), is([
            "derived: bike",
            "derived: submarine",
          ]))
        })
      ]
    }),

])

