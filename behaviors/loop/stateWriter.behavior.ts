import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, assignedWith, equalTo, expect, is, Matcher, objectWith } from "great-expectations";
import { container, useWriter, withInitialValue } from "@src/index.js";
import { Container } from "@src/loop.js";
import { testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { TestWriter } from "./helpers/testWriter.js";

// Here I think this should just be a Container<string>
// But then there is a meta(container) that will change as the write
// emits messages
interface ContainerWithWriterContext {
  container: Container<string>
  writer: TestWriter<string>
}

const simpleManagedContainer =
  example(testSubscriberContext<ContainerWithWriterContext>())
    .description("update to simple container")
    .script({
      suppose: [
        fact("there is a container that uses a writer", (context) => {
          const containerState = container(withInitialValue("initial"))
          const writer = new TestWriter<string>()
          writer.setHandler(async (value, _, set, waitFor) => {
            set(value)
            const writtenValue = await waitFor()
            set(writtenValue)
          })
          useWriter(containerState, writer)

          context.setState({
            container: containerState,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.container, "sub-one")
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(meta(context.state.container), "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            // writeUnknownMessage()
            equalTo("initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a write message is dispatched for the container", (context) => {
          // here we would just write "Something Funny!"
          context.write(context.state.container, "Something Funny!")
          // context.update((loop) => {
            // loop.dispatch(testWriteMessage(context.state.container, {
              // type: "write-pending",
              // value: "Something Funny!"
            // }))
          // })
        })
      ],
      observe: [
        effect("the writer gets the data to update", (context) => {
          // the writer gets the data
          expect(context.state.writer.lastValueToWrite, is(assignedWith(equalTo("Something Funny!"))))
          // expect(context.state.writer.lastValueToWrite, is(assignedWith(writePendingMessage("Something Funny!"))))
        }),
        effect("the subscriber does not receive the message yet", (context) => {
          // the subscriber should not get anything yet
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            equalTo("initial"),
            // writePendingMessage("Something Funny!")
          ])))
        }),
        // but the meta container gets a pending message
        effect("the subscriber to the meta container gets a pending message", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            pendingMessage("Something Funny!")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager writes the value and publishes it", (context) => {
          context.state.writer.resolveWith?.("Wrote Something Funny!")
          // context.state.writer.resolveWith?.({ type: "write-ok", value: "Wrote Something Funny!" })
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          // the subscriber just receives Wrote Something Funny!
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            // writeUnknownMessage(),
            equalTo("initial"),
            equalTo("Wrote Something Funny!")
            // writePendingMessage("Something Funny!"),
            // writeOkMessage("Wrote Something Funny!")
          ])))
        }),
        effect("the meta subscriber receives an ok value", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            pendingMessage("Something Funny!"),
            okMessage("Wrote Something Funny!")
          ])))
        })
      ]
    })

// interface ContainerAndStateWithWriter {
//   userIdState: Container<number>
//   container: Container<TestWritable<string>>
//   writer: TestWriter<string>
// }

// const writerThatUsesOtherState =
//   example(testSubscriberContext<ContainerAndStateWithWriter>())
//     .description("writer that uses other state")
//     .script({
//       suppose: [
//         fact("there is a container with a writer", (context) => {
//           const userIdState = container(withInitialValue(28))
//           const thingContainer = container<TestWritable<string>>(withInitialValue({ type: "write-unknown" }))
//           const writer = new TestWriter<string>()
//           writer.setHandler(async (value, get, set, waitFor) => {
//             if (value.type === "write-pending") {
//               set({ type: "write-pending", value: `Writing ${value.value} for user ${get(userIdState)}` })
//             }
//             const thing = await waitFor()
//             if (thing.type === "write-ok") {
//               set({ type: "write-ok", value: `Wrote ${thing.value} for user ${get(userIdState)}` })
//             }
//           })
//           useWriter(thingContainer, writer)
//           context.setState({
//             userIdState,
//             container: thingContainer,
//             writer
//           })
//         }),
//         fact("there is a subscriber", (context) => {
//           context.subscribeTo(context.state.container, "sub-one")
//         })
//       ],
//       observe: [
//         effect("the subscriber gets the initial state with the derived key", (context) => {
//           expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
//             writeUnknownMessage()
//           ])))
//         })
//       ]
//     }).andThen({
//       perform: [
//         step("a value is written to the container", (context) => {
//           context.update((loop) => {
//             loop.dispatch(testWriteMessage(context.state.container, { type: "write-pending", value: "hello" }))
//           })
//         })
//       ],
//       observe: [
//         effect("the subscriber gets the pending write value", (context) => {
//           expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
//             writeUnknownMessage(),
//             writePendingMessage("Writing hello for user 28")
//           ])))
//         })
//       ]
//     }).andThen({
//       perform: [
//         step("the user id state changes", (context) => {
//           context.write(context.state.userIdState, 41)
//         }),
//         step("the write completes", (context) => {
//           context.state.writer.resolveWith?.({ type: "write-ok", value: "wrote-hello" })
//         })
//       ],
//       observe: [
//         effect("the subscriber gets the written message with the new userId", (context) => {
//           expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
//             writeUnknownMessage(),
//             writePendingMessage("Writing hello for user 28"),
//             writeOkMessage("Wrote wrote-hello for user 41")
//           ])))
//         })
//       ]
//     })

// function writeUnknownMessage(): Matcher<TestWritable<string>> {
//   return objectWith({
//     type: equalTo("write-unknown")
//   })
// }

// function writePendingMessage(value: string): Matcher<TestWritable<string>> {
//   return objectWith({
//     type: equalTo("write-pending"),
//     value: equalTo(value)
//   })
// }

// function writeOkMessage(value: string): Matcher<TestWritable<string>> {
//   return objectWith({
//     type: equalTo("write-ok"),
//     value: equalTo(value)
//   })
// }

export default behavior("Managed Update", [
  simpleManagedContainer,
  // writerThatUsesOtherState
])