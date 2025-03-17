import { createStore, deserialize, ErrorMessage, serialize, State, supplied } from "@store/index.js";
import { behavior, effect, example, step } from "best-behavior";
import { arrayWith, equalTo, expect, is, objectWith } from "great-expectations";
import { StoreValuesEffect, testStoreContext } from "./helpers/testStore";

export default behavior("serialize state", [

  example(testStoreContext<SerializableStore>())
    .description("serializing container with meta state")
    .script({
      perform: [
        step("initialize meta state of container", (context) => {
          context.initialize(token, actions => {
            actions.error("Failed!")
          })
        }),
        step("serialize the tokens into an alt store and subscribe to the token", (context) => {
          const altStore = createStore();
          
          ((globalThis) => {
            eval(serialize(context.store, tokenMap))
            deserialize(altStore, tokenMap, globalThis)
          })({})

          const tokenQuery = new StoreValuesEffect(get => get(token))
          const metaTokenQuery = new StoreValuesEffect(get => get(token.meta))
          altStore.useEffect(tokenQuery)
          altStore.useEffect(metaTokenQuery)

          context.setTokens({
            tokenQuery,
            metaTokenQuery
          })
        })
      ],
      observe: [
        effect("the token has the initial value", (context) => {
          expect(context.tokens.tokenQuery.values, is([
            "initial"
          ]))
        }),
        effect("the meta token in the alt store has the serialized value", (context) => {
          expect(context.tokens.metaTokenQuery.values, is(arrayWith<ErrorMessage<any, any>>([
            objectWith({
              type: equalTo("error"),
              reason: equalTo("Failed!")
            })
          ])))
        })
      ]
    })

])

interface SerializableStore {
  tokenQuery: StoreValuesEffect
  metaTokenQuery: StoreValuesEffect
}

const token = supplied<string, string>({ initialValue: "initial" })

const tokenMap = new Map<string, State<any>>([
  [ "token", token ],
])