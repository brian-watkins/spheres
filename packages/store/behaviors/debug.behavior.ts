import { State, container, value } from "@src/index.js";
import { behavior, effect, example, fact } from "esbehavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore.js";

interface SimpleTokenContext {
  stringState: State<string>
}

export default behavior("debug name", [
  example(testStoreContext<SimpleTokenContext>())
    .description("container with debug name")
    .script({
      suppose: [
        fact("there is a container with a set debug name", (context) => {
          context.setTokens({
            stringState: container({
              initialValue: "hello",
              name: "my-container"
            })
          })
        })
      ],
      observe: [
        effect("the state token's name is printed", (context) => {
          expect(context.tokens.stringState.toString(), is("my-container"))
        })
      ]
    }),
  example(testStoreContext<SimpleTokenContext>())
    .description("no debug name is provided for a container")
    .script({
      suppose: [
        fact("there is a container with no debug name", (context) => {
          context.setTokens({
            stringState: container({ initialValue: "yo yo!" })
          })
        })
      ],
      observe: [
        effect("the default token name is printed", (context) => {
          expect(context.tokens.stringState.toString(), is("State"))
        })
      ]
    }),
  example(testStoreContext<SimpleTokenContext>())
    .description("value with debug name")
    .script({
      suppose: [
        fact("there is a value with a debug name", (context) => {
          context.setTokens({
            stringState: value({
              query: () => "blah",
              name: "funny-value"
            })
          })
        })
      ],
      observe: [
        effect("the state token's name is printed", (context) => {
          expect(context.tokens.stringState.toString(), is("funny-value"))
        })
      ]
    }),
  example(testStoreContext<SimpleTokenContext>())
    .description("no debug name is provided for a value")
    .script({
      suppose: [
        fact("there is a value with no debug name", (context) => {
          context.setTokens({
            stringState: value({ query: () => "blah" })
          })
        })
      ],
      observe: [
        effect("the state token's name is printed", (context) => {
          expect(context.tokens.stringState.toString(), is("State"))
        })
      ]
    }),
  example(testStoreContext<SimpleTokenContext>())
    .description("the meta token's name")
    .script({
      suppose: [
        fact("there is a container with some name", (context) => {
          context.setTokens({
            stringState: container({
              initialValue: "hello",
              name: "super-state"
            })
          })
        })
      ],
      observe: [
        effect("the meta state token's name is printed", (context) => {
          expect(context.tokens.stringState.meta.toString(), is("meta[super-state]"))
        })
      ]
    })
])
