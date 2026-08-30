import { behavior } from "best-behavior";
import { reconcileArray, reconcileObject, Reconciler } from "@store/state/reconciler";
import { expect, identicalTo, is } from "great-expectations";
import { test } from "../helpers/testExample";

interface Message {
  id: string
  text: string
}

interface Group {
  id: string
  messages: Array<Message>
}

function message(id: string, text: string): Message {
  return { id, text }
}

const reconcileMessages: Reconciler<Array<Message>> = reconcileArray<Message>({ key: item => item.id })

export default behavior("matching elements across a collection", [

  test("elements are recreated but unchanged", () => {
    const current = [message("1", "hello"), message("2", "there")]
    const next = [message("1", "hello"), message("2", "there")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled, is(identicalTo(current)))
  }),

  test("recreated elements move to a different position", () => {
    const current = [message("1", "hello"), message("2", "there"), message("3", "world")]
    const next = [message("3", "world"), message("1", "hello"), message("2", "there")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled !== current, is(true))
    expect(reconciled[0], is(identicalTo(current[2])))
    expect(reconciled[1], is(identicalTo(current[0])))
    expect(reconciled[2], is(identicalTo(current[1])))
  }),

  test("one element is new and the rest moved", () => {
    const current = [message("1", "hello"), message("2", "there")]
    const next = [message("2", "there"), message("3", "world"), message("1", "hello")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled[0], is(identicalTo(current[1])))
    expect(reconciled[1], is(identicalTo(next[1])))
    expect(reconciled[2], is(identicalTo(current[0])))
  }),

  test("elements are removed", () => {
    const current = [message("1", "hello"), message("2", "there"), message("3", "world")]
    const next = [message("3", "world"), message("1", "hello")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled.length, is(2))
    expect(reconciled[0], is(identicalTo(current[2])))
    expect(reconciled[1], is(identicalTo(current[0])))
  }),

  test("a matched element keeps the current value by default", () => {
    const current = [message("1", "hello")]
    const next = [message("1", "goodbye")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled, is(identicalTo(current)))
  }),

  test("a matched element is reconciled field by field", () => {
    const reconciler: Reconciler<Array<Message>> = reconcileArray<Message>({
      key: item => item.id,
      itemReconciler: reconcileObject()
    })

    const current = [message("1", "hello"), message("2", "there")]
    const next = [message("1", "hello"), message("2", "everyone")]

    const reconciled = reconciler(current, next)

    expect(reconciled !== current, is(true))
    expect(reconciled[0], is(identicalTo(current[0])))
    expect(reconciled[1], is(identicalTo(next[1])))
  }),

  test("nested collections are reconciled inside a matched element", () => {
    const reconciler = reconcileArray<Group>({
      key: group => group.id,
      itemReconciler: reconcileObject<Group>({
        messages: reconcileArray<Message>({ key: item => item.id, itemReconciler: reconcileObject() })
      })
    })

    const current: Array<Group> = [
      { id: "a", messages: [message("1", "hello"), message("2", "there")] },
      { id: "b", messages: [message("3", "world")] }
    ]

    const next: Array<Group> = [
      { id: "b", messages: [message("3", "world")] },
      { id: "a", messages: [message("1", "hello"), message("2", "everyone")] }
    ]

    const reconciled = reconciler(current, next)

    // group b did not change at all
    expect(reconciled[0], is(identicalTo(current[1])))
    // group a changed, but only in the message that changed
    expect(reconciled[1] !== current[0], is(true))
    expect(reconciled[1].messages[0], is(identicalTo(current[0].messages[0])))
    expect(reconciled[1].messages[1], is(identicalTo(next[1].messages[1])))
  }),

  // This is probably not necessary
  test("elements with no identity are matched by a serialized key", () => {
    const current = [{ name: "cool", count: 7 }, { name: "awesome", count: 3 }]
    const next = [{ name: "awesome", count: 3 }, { name: "cool", count: 7 }]

    const reconciled = reconcileArray<{ name: string, count: number }>({ key: item => JSON.stringify(item) })(current, next)

    expect(reconciled[0], is(identicalTo(current[1])))
    expect(reconciled[1], is(identicalTo(current[0])))
  }),

  test("with no key, counterparts are found by position", () => {
    const reconciler = reconcileArray<Message>({
      itemReconciler: reconcileObject<Message>()
    })

    const current = [message("1", "hello"), message("2", "there")]
    const next = [message("1", "hello"), message("2", "everyone")]

    const reconciled = reconciler(current, next)

    expect(reconciled[0], is(identicalTo(current[0])))
    expect(reconciled[1], is(identicalTo(next[1])))
  }),

  test("reconciling moved items by position", () => {
    const reconciler = reconcileArray<Message>({
      itemReconciler: reconcileObject<Message>()
    })

    const current = [message("1", "hello"), message("2", "there")]
    const next = [message("2", "there"), message("1", "hello")]

    const reconciled = reconciler(current, next)

    expect(reconciled[0], is(identicalTo(next[0])))
    expect(reconciled[1], is(identicalTo(next[1])))
  }),

  test("elements past the end of the current collection are new", () => {
    const reconciler = reconcileArray<Message>({
      itemReconciler: reconcileObject<Message>()
    })

    const current = [message("1", "hello")]
    const next = [message("1", "hello"), message("2", "there")]

    const reconciled = reconciler(current, next)

    expect(reconciled[0], is(identicalTo(current[0])))
    expect(reconciled[1], is(identicalTo(next[1])))
  }),

  test("duplicated keys are matched one for one", () => {
    const current = [message("1", "hello"), message("1", "hello"), message("2", "there")]
    const next = [message("1", "hello"), message("2", "there"), message("1", "hello"), message("1", "hello")]

    const reconciled = reconcileMessages(current, next)

    expect(reconciled[0], is(identicalTo(current[0])))
    expect(reconciled[1], is(identicalTo(current[2])))
    expect(reconciled[2], is(identicalTo(current[1])))
    expect(reconciled[3], is(identicalTo(next[3])))
  })

  // What about the case where the key function returns undefined or something?

])
