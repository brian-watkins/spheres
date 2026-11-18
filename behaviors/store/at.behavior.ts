import { behavior, effect, example, fact, step } from "best-behavior"
import { testStoreContext } from "./helpers/testStore.js"
import { container, Container, meta, ReactiveEffectHandle, reset, useEffect } from "@store/index.js"
import { arrayWith, expect, is } from "great-expectations"
import { okMessage, pendingMessage } from "./helpers/metaMatchers.js"

interface Person {
  name: Container<string>
}

interface Team {
  leader: Container<Person>
}

interface AtContext {
  name: Container<string>
  otherName: Container<string>
  leader: Container<Person>
  otherLeader: Container<Person>
  team: Container<Team>
}

export default behavior("at", [
  example(testStoreContext<AtContext>())
    .description("multiple levels of nested containers")
    .script({
      suppose: [
        fact("there are containers nested several levels deep", (context) => {
          const name = container({ initialValue: "brian" })
          const leader = container({ initialValue: { name } })
          context.setTokens({
            name,
            otherName: container({ initialValue: "carol" }),
            leader,
            otherLeader: container({
              initialValue: { name: container({ initialValue: "dave" }) },
            }),
            team: container({ initialValue: { leader } }),
          })
        }),
        fact("there is a subscriber to the innermost container via at", (context) => {
          context.subscribeTo(
            context.tokens.team.at((team) => team.leader).at((leader) => leader.name),
            "name-sub",
          )
        }),
      ],
      perform: [
        step("the innermost container is updated", (context) => {
          context.writeTo(context.tokens.name, "alice")
        }),
      ],
      observe: [
        effect("the subscriber gets the initial value and the update", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is(["brian", "alice"]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the middle container is updated to contain a different container", (context) => {
          context.writeTo(context.tokens.leader, { name: context.tokens.otherName })
        }),
      ],
      observe: [
        effect("the subscriber gets the value of the new innermost container", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is(["brian", "alice", "carol"]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the outer container is updated to contain a different container", (context) => {
          context.writeTo(context.tokens.team, { leader: context.tokens.otherLeader })
        }),
      ],
      observe: [
        effect("the subscriber gets the value from the new chain of containers", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is(["brian", "alice", "carol", "dave"]))
        }),
      ],
    }),
  example(testStoreContext<UnsubscribeContext>())
    .description("effect that reads via at unsubscribes")
    .script({
      suppose: [
        fact("there is a container whose value contains a container", (context) => {
          const tokens: UnsubscribeContext = {
            person: container({
              initialValue: { name: container({ initialValue: "brian" }) },
            }),
            otherName: container({ initialValue: "carol" }),
            values: [],
          }
          context.setTokens(tokens)
        }),
        fact("there is an effect that reads the inner container via at", (context) => {
          const tokens = context.tokens
          tokens.handle = useEffect(context.store, {
            run: (get) => {
              tokens.values.push(get(tokens.person.at((person) => person.name)))
            },
          })
        }),
      ],
      perform: [
        step("the effect unsubscribes", (context) => {
          context.tokens.handle?.unsubscribe()
        }),
        step("the outer container is updated to contain a different container", (context) => {
          context.writeTo(context.tokens.person, { name: context.tokens.otherName })
        }),
      ],
      observe: [
        effect("the effect does not run again", (context) => {
          expect(context.tokens.values, is(["brian"]))
        }),
      ],
    }),
  example(testStoreContext<WriteContext>())
    .description("writing to a container accessed via at")
    .script({
      suppose: [
        fact("there is a container whose value contains a container", (context) => {
          const name = container({ initialValue: "brian" })
          context.setTokens({
            name,
            person: container({ initialValue: { name } }),
          })
        }),
        fact("there is a subscriber to the inner container", (context) => {
          context.subscribeTo(context.tokens.name, "name-sub")
        }),
      ],
      perform: [
        step("the inner container is written to via at", (context) => {
          context.writeTo(
            context.tokens.person.at((person) => person.name),
            "alice",
          )
        }),
      ],
      observe: [
        effect("the subscriber to the inner container gets the update", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is(["brian", "alice"]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("the inner container is reset via at", (context) => {
          context.store.dispatch(reset(context.tokens.person.at((person) => person.name)))
        }),
      ],
      observe: [
        effect("the subscriber to the inner container gets the initial value", (context) => {
          expect(context.valuesForSubscriber("name-sub"), is(["brian", "alice", "brian"]))
        }),
      ],
    }),
  example(testStoreContext<MetaContext>())
    .description("meta state of a container accessed via at")
    .script({
      suppose: [
        fact("there is a container whose value contains a container", (context) => {
          const name = container({ initialValue: "brian" })
          context.setTokens({
            name,
            otherName: container({ initialValue: "carol" }),
            person: container({ initialValue: { name } }),
          })
        }),
        fact("the inner containers become pending when written", (context) => {
          for (const token of [context.tokens.name, context.tokens.otherName]) {
            context.useContainerHooks(token, {
              async onWrite(message, actions) {
                actions.pending(message)
              },
            })
          }
        }),
        fact("there is a subscriber to the meta state of the inner container via at", (context) => {
          context.subscribeTo(
            context.tokens.person.at((person) => meta(person.name)),
            "meta-sub",
          )
        }),
      ],
      perform: [
        step("the inner container is written to", (context) => {
          context.writeTo(context.tokens.name, "alice")
        }),
      ],
      observe: [
        effect("the subscriber gets the pending meta state", (context) => {
          expect(
            context.valuesForSubscriber("meta-sub"),
            is(arrayWith([okMessage(), pendingMessage("alice")])),
          )
        }),
      ],
    })
    .andThen({
      perform: [
        step("the outer container is updated to contain a different container", (context) => {
          context.writeTo(context.tokens.person, { name: context.tokens.otherName })
        }),
      ],
      observe: [
        effect("the subscriber gets the meta state of the new inner container", (context) => {
          expect(
            context.valuesForSubscriber("meta-sub"),
            is(arrayWith([okMessage(), pendingMessage("alice"), okMessage()])),
          )
        }),
      ],
    })
    .andThen({
      perform: [
        step("the new inner container is written to", (context) => {
          context.writeTo(context.tokens.otherName, "dave")
        }),
      ],
      observe: [
        effect(
          "the subscriber gets the pending meta state of the new inner container",
          (context) => {
            expect(
              context.valuesForSubscriber("meta-sub"),
              is(
                arrayWith([
                  okMessage(),
                  pendingMessage("alice"),
                  okMessage(),
                  pendingMessage("dave"),
                ]),
              ),
            )
          },
        ),
      ],
    }),
])

interface MetaContext {
  name: Container<string>
  otherName: Container<string>
  person: Container<Person>
}

interface WriteContext {
  name: Container<string>
  person: Container<Person>
}

interface UnsubscribeContext {
  person: Container<Person>
  otherName: Container<string>
  handle?: ReactiveEffectHandle
  values: Array<string>
}
