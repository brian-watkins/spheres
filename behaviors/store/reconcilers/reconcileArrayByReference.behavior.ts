import { behavior } from "best-behavior";
import { reconcileArray } from "@store/state/reconciler";
import { expect, identicalTo, is } from "great-expectations";
import { test } from "../helpers/testExample";

export default behavior("reconcile arrays by reference", [

  test("arrays with the same elements", () => {
    const one = {}
    const two = {}
    const three = {}

    const a = [one, two, three]
    const b = [one, two, three]

    const reconciled = reconcileArray()(a, b)

    expect(reconciled, is(identicalTo(a)))
  }),

  test("next array starts with same elements as current", () => {
    const one = {}
    const two = {}
    const three = {}

    const a = [one, two, three]
    const b = [one, two, three, {}, {}]

    const reconciled = reconcileArray()(a, b)

    expect(reconciled[0], is(identicalTo(one)))
    expect(reconciled[1], is(identicalTo(two)))
    expect(reconciled[2], is(identicalTo(three)))
    expect(reconciled.length, is(5))
    expect(a !== b, is(true))
  }),

  test("current array starts with same elements as next", () => {
    const one = {}
    const two = {}
    const three = {}

    const a = [one, two, three, {}, {}]
    const b = [one, two, three]

    const reconciled = reconcileArray()(a, b)

    expect(reconciled[0], is(identicalTo(one)))
    expect(reconciled[1], is(identicalTo(two)))
    expect(reconciled[2], is(identicalTo(three)))
    expect(reconciled.length, is(3))
    expect(a !== b, is(true))
  }),

  test("arrays with different elements", () => {
    const one = {}
    const two = {}
    const three = {}
    const four = {}
    const a = [one, two]
    const b = [three, four]

    const reconciled = reconcileArray()(a, b)

    expect(reconciled[0], is(identicalTo(three)))
    expect(reconciled[1], is(identicalTo(four)))
    expect(reconciled.length, is(2))
    expect(reconciled !== a, is(true))
  }),

  test("new array with old elements in different order", () => {
    const one = {}
    const two = {}
    const three = {}

    const a = [one, two, three]
    const b = [three, one, two]

    const reconciled = reconcileArray()(a, b)
    expect(reconciled[0], is(identicalTo(three)))
    expect(reconciled[1], is(identicalTo(one)))
    expect(reconciled[2], is(identicalTo(two)))
    expect(reconciled.length, is(3))
  })

])
