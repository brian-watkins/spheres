import { State, container, value } from "@src/index.js";
import { Observation, behavior, effect, example, fact } from "esbehavior";
import { expect, is, stringMatching } from "great-expectations";
import { TestStore, testStoreContext } from "helpers/testStore.js";

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
        stateTokenHasNameBasedOn("my-container")
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
        stateTokenHasNameBasedOn("container")
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
        stateTokenHasNameBasedOn("funny-value")
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
        stateTokenHasNameBasedOn("value")
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
        metaStateTokenHasNameBasedOn("super-state")
      ]
    })
])

function stateTokenHasNameBasedOn(expectedName: string): Observation<TestStore<SimpleTokenContext>> {
  return effect("the state token's name is printed", (context) => {
    expect(context.tokens.stringState.toString(), is(stringMatching(new RegExp(`^\\[${expectedName} \\d+\\]$`))))
  })
}

function metaStateTokenHasNameBasedOn(expectedName: string): Observation<TestStore<SimpleTokenContext>> {
  return effect("the meta state token's name is printed", (context) => {
    expect(context.tokens.stringState.meta.toString(), is(stringMatching(new RegExp(`^meta\\[${expectedName} \\d+\\]$`))))
  })
}
