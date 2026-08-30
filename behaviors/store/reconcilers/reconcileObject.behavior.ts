import { behavior } from "best-behavior";
import { expect, identicalTo, is } from "great-expectations";
import { test } from "../helpers/testExample";
import { reconcileArray, reconcileObject, useCurrent } from "@store/state/reconciler";

interface Author {
  id: string
  name: string
}

interface Post {
  title: string
  author: Author
  tags: Array<string>
}

interface Settings {
  theme: string
  fontSize?: number
}

function post(title: string, author: Author, tags: Array<string>): Post {
  return { title, author, tags }
}

const reconcilePost = reconcileObject<Post>({
  author: reconcileObject<Author>(),
  tags: reconcileArray<string>()
})

export default behavior("reconciling the fields of an object", [

  test("the very same object", () => {
    const current = post("Hello", { id: "1", name: "Ana" }, ["news"])

    const reconciled = reconcilePost(current, current)

    expect(reconciled, is(identicalTo(current)))
  }),

  test("an object recreated with every field unchanged", () => {
    const author = { id: "1", name: "Ana" }
    const tags = ["news"]

    const current = post("Hello", author, tags)
    const next = post("Hello", author, tags)

    const reconciled = reconcilePost(current, next)

    expect(reconciled, is(identicalTo(current)))
  }),

  test("every field changed", () => {
    const current = post("Hello", { id: "1", name: "Ana" }, ["news"])
    const next = post("Goodbye", { id: "2", name: "Bo" }, ["sports"])

    const reconciled = reconcilePost(current, next)

    expect(reconciled, is(identicalTo(next)))
  }),

  test("some fields are carried over and some are not", () => {
    const current = post("Hello", { id: "1", name: "Ana" }, ["news"])
    const next = post("Goodbye", { id: "1", name: "Ana" }, ["news"])

    const reconciled = reconcilePost(current, next)

    expect(reconciled !== current, is(true))
    expect(reconciled !== next, is(true))
    expect(reconciled.title, is("Goodbye"))
    expect(reconciled.author, is(identicalTo(current.author)))
    expect(reconciled.tags, is(identicalTo(current.tags)))
  }),

  test("when no field reconciler is specified, it compares by reference", () => {
    const reconcileByReference = reconcileObject<Post>()

    const user = { id: "1", name: "Ana" }

    const current = post("Hello", user, ["news"])
    const next = post("Hello", user, ["news"])

    const reconciled = reconcileByReference(current, next)

    expect(reconciled, is(identicalTo(next)))
  }),

  test("a field was added", () => {
    const reconcileSettings = reconcileObject<Settings>()

    const current: Settings = { theme: "dark" }
    const next: Settings = { theme: "dark", fontSize: 12 }

    const reconciled = reconcileSettings(current, next)

    expect(reconciled, is(identicalTo(next)))
  }),

  test("a field was removed", () => {
    const reconcileSettings = reconcileObject<Settings>()

    const current: Settings = { theme: "dark", fontSize: 12 }
    const next: Settings = { theme: "dark" }

    const reconciled = reconcileSettings(current, next)

    expect(reconciled, is(identicalTo(next)))
  }),

  test("a field is pinned to the current value", () => {
    const reconcileSettings = reconcileObject<Settings>({
      fontSize: useCurrent
    })

    const current: Settings = { theme: "dark", fontSize: 12 }
    const next: Settings = { theme: "light", fontSize: 14 }

    const reconciled = reconcileSettings(current, next)

    expect(reconciled.theme, is("light"))
    expect(reconciled.fontSize, is(12))
  })

])
