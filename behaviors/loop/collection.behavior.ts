import { Container, container } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, arrayWithLength, equalTo, expect, is, Matcher, objectWith, objectWithProperty } from "great-expectations";
import { testSubscriberContext } from "./helpers/testSubscriberContext";
import { Collection, insertMessage, withCollection } from "@src/collection/index.js"

interface StringCollectionContext {
  collection: Container<Collection<string>>
}

const emptyCollection =
  example(testSubscriberContext<StringCollectionContext>())
    .description("empty collection")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          const collection = container(withCollection<string>())
          context.setState({
            collection
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.collection, "sub-one")
        })
      ],
      observe: [
        effect("the initial state is an empty array", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            objectWithProperty("items", arrayWithLength(0))
          ])))
        })
      ]
    })

const insertCollection =
  example(testSubscriberContext<StringCollectionContext>())
    .description("insert into collection")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          const collection = container(withCollection<string>())
          context.setState({
            collection
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.collection, "sub-one")
        })
      ],
      perform: [
        step("insert an item into the collection", (context) => {
          context.update((loop) => {
            loop.dispatch(insertMessage(context.state.collection, "hello!"))
          })
        }),
        step("insert another item into the collection", (context) => {
          context.update((loop) => {
            loop.dispatch(insertMessage(context.state.collection, "have fun!"))
          })
        })
      ],
      observe: [
        effect("the values are inserted into the collection in order", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            collectionWithItems([]),
            collectionWithItems(["hello!"]),
            collectionWithItems(["hello!", "have fun!"]),
          ])))
        })
      ]
    })

function collectionWithItems<T>(items: Array<T>): Matcher<Collection<T>> {
  return objectWith({
    "items": equalTo(items)
  })
}

export default behavior("collection", [
  emptyCollection,
  insertCollection
])