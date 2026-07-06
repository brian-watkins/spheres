import { behavior, contextMap, effect, example, fact, step } from "best-behavior"
import { renderContext } from "./helpers/renderContext.js"
import { equalTo, expect, is, Matcher, message, valueWhere } from "great-expectations"
import { Container, container } from "@store/index.js"
import { HTMLView, UseItem } from "@view/index"
import { fuzzContext, FuzzState, Mutation } from "./helpers/fuzzContext.js"

class ListFuzzState implements FuzzState<Array<string>> {
  private counter: number = 0

  constructor(private seed: number, public current: Array<string>) { }

  uniqueItem() {
    return `item-${this.seed}-${this.counter++}`
  }

  next(val: Array<string>): this {
    this.current = val
    return this
  }
}

type ListMutation = Mutation<Array<string>, ListFuzzState>

const shuffle: ListMutation = {
  name: "shuffle",
  apply(state, generator) {
    const next = [...state.current]
    for (let i = next.length - 1; i > 0; i--) {
      const j = generator.randomInt(i + 1);
      [next[i], next[j]] = [next[j], next[i]]
    }
    return state.next(next)
  }
}

const reverse: ListMutation = {
  name: "reverse",
  apply(state) {
    return state.next([...state.current].reverse())
  }
}

const moveOne: ListMutation = {
  name: "moveOne",
  apply(state, generator) {
    if (state.current.length < 2) return state
    const next = [...state.current]
    const from = generator.randomInt(next.length)
    const [item] = next.splice(from, 1)
    next.splice(generator.randomInt(next.length + 1), 0, item)
    return state.next(next)
  }
}

const swapTwo: ListMutation = {
  name: "swapTwo",
  apply(state, generator) {
    if (state.current.length < 2) return state
    const next = [...state.current]
    const a = generator.randomInt(next.length)
    const b = generator.randomInt(next.length);
    [next[a], next[b]] = [next[b], next[a]]
    return state.next(next)
  }
}

const removeSome: ListMutation = {
  name: "removeSome",
  apply(state, generator) {
    if (state.current.length === 0) return state
    const next = [...state.current]
    const count = 1 + generator.randomInt(Math.min(3, next.length))
    for (let i = 0; i < count && next.length > 0; i++) {
      next.splice(generator.randomInt(next.length), 1)
    }
    return state.next(next)
  }
}

const insertSome: ListMutation = {
  name: "insertSome",
  apply(state, generator) {
    const next = [...state.current]
    const count = 1 + generator.randomInt(3)
    for (let i = 0; i < count; i++) {
      next.splice(generator.randomInt(next.length + 1), 0, state.uniqueItem())
    }
    return state.next(next)
  }
}

const replaceSome: ListMutation = {
  name: "replaceSome",
  apply(state, generator) {
    if (state.current.length === 0) return state
    const next = [...state.current]
    const count = 1 + generator.randomInt(Math.min(3, next.length))
    for (let i = 0; i < count; i++) {
      next[generator.randomInt(next.length)] = state.uniqueItem()
    }
    return state.next(next)
  }
}

const clearAll: ListMutation = {
  name: "clearAll",
  apply(state) {
    return state.next([])
  }
}

const freshList: ListMutation = {
  name: "freshList",
  apply(state, generator) {
    const size = generator.randomInt(12)
    const next: Array<string> = []
    for (let i = 0; i < size; i++) {
      next.push(state.uniqueItem())
    }
    return state.next(next)
  }
}

const noChange: ListMutation = {
  name: "noChange",
  apply(state) {
    return state.next([...state.current])
  }
}

const prependSome: ListMutation = {
  name: "prependSome",
  apply(state, generator) {
    const count = 1 + generator.randomInt(3)
    const added: Array<string> = []
    for (let i = 0; i < count; i++) {
      added.push(state.uniqueItem())
    }
    return state.next([...added, ...state.current])
  }
}

const shrinkToOne: ListMutation = {
  name: "shrinkToOne",
  apply(state, generator) {
    if (state.current.length === 0) return state
    return state.next([state.current[generator.randomInt(state.current.length)]])
  }
}

const removeInsertAndShuffle: ListMutation = {
  name: "removeInsertAndShuffle",
  apply(state, generator) {
    const removedSome = removeSome.apply(state, generator)
    const insertedSome = insertSome.apply(removedSome, generator)
    return shuffle.apply(insertedSome, generator)
  }
}

// weighted so structural churn dominates, with occasional degenerate cases
const mutations: Array<ListMutation> = [
  shuffle, shuffle,
  reverse,
  moveOne, moveOne,
  swapTwo, swapTwo,
  removeSome, removeSome,
  insertSome, insertSome,
  replaceSome, replaceSome,
  removeInsertAndShuffle, removeInsertAndShuffle,
  prependSome, prependSome,
  shrinkToOne,
  noChange,
  clearAll,
  freshList
]

// ---- item views ----

function elementItemView(stateful: UseItem<string>): HTMLView {
  return root => {
    root.p(el => {
      el.config
        .dataAttribute("child")
        .dataAttribute("key", stateful(item => item.data))
      el.children.textNode(stateful(item => `${item.data} (${item.index})`))
    })
  }
}

function fragmentItemView(stateful: UseItem<string>): HTMLView {
  return root => {
    root
      .h3(el => {
        el.config.dataAttribute("key", stateful(item => item.data))
        el.children.textNode(stateful(item => item.data))
      })
      .p(el => {
        el.config.dataAttribute("child")
        el.children.textNode(stateful(item => `${item.data} (${item.index})`))
      })
  }
}

// ---- verification ----

function currentKeyedElements(): Map<string, Element> {
  const elements = new Map<string, Element>()
  for (const el of Array.from(document.querySelectorAll("[data-key]"))) {
    elements.set(el.getAttribute("data-key")!, el)
  }
  return elements
}

function verifyRenderedList(expected: Array<string>, elementsBeforePatch: Map<string, Element>, detail: string) {
  const actualTexts = Array.from(document.querySelectorAll("[data-child]"))
    .map(el => el.textContent)
  const expectedTexts = expected.map((key, index) => `${key} (${index})`)

  expect(actualTexts, is(equalTo(expectedTexts)), detail)

  expect(
    currentKeyedElements(), is(subsetOfMap(elementsBeforePatch)),
    `An item was recreated instead of moved ${detail}`
  )
}

function subsetOfMap<K, V>(map: Map<K, V>): Matcher<Map<K, V>> {
  return valueWhere(actual => {
    for (const [key, value] of actual) {
      const original = map.get(key)
      if (original !== undefined && original !== value) {
        return false
      }
    }
    return true
  }, message`a subset of ${map}`)
}

// ---- fuzz examples ----

const updatesPerRun = 15

interface ListContext {
  items: Container<Array<string>>
}

function listFuzzContext(seed: number) {
  return contextMap({
    app: renderContext<ListContext>(),
    fuzz: fuzzContext({
      seed,
      mutations,
      initialState(generator) {
        return freshList.apply(new ListFuzzState(seed, []), generator)
      },
    })
  })
}

function fuzzExample(description: string, seed: number, itemView: (stateful: UseItem<string>) => HTMLView) {
  return example(listFuzzContext(seed))
    .description(`${description} (seed ${seed})`)
    .script({
      suppose: [
        fact("there is a randomly generated list of unique items", ({ app, fuzz }) => {
          app.setState({
            items: container({ initialValue: fuzz.current })
          })
        }),
        fact("the list is rendered", ({ app }) => {
          app.mountView(root => {
            root.div(el => {
              el.children.subviews(get => get(app.state.items), itemView)
            })
          })
        })
      ],
      perform: [
        step(`the list is randomly mutated ${updatesPerRun} times, checking the rendered output after each change`, ({ app, fuzz }) => {
          for (let i = 0; i < updatesPerRun; i++) {
            const current = fuzz.current
            const next = fuzz.next

            const elementsBeforePatch = currentKeyedElements()
            app.writeTo(app.state.items, next)

            verifyRenderedList(
              next,
              elementsBeforePatch,
              `after update ${i + 1} (${fuzz.lastMutation.name}) from ${JSON.stringify(current)} to ${JSON.stringify(next)}`
            )
          }
        })
      ],
      observe: [
        effect("the rendered items match the final list data", ({ fuzz }) => {
          const actualTexts = Array.from(document.querySelectorAll("[data-child]"))
            .map(el => el.textContent)
          expect(actualTexts, is(equalTo(
            fuzz.current.map((key, index) => `${key} (${index})`)
          )))
        })
      ]
    })
}

const elementSeeds = [1, 2, 3, 4, 5, 6, 7, 8]
const fragmentSeeds = [101, 102, 103, 104, 105, 106, 107, 108]

export default behavior("list fuzz", [
  ...elementSeeds.map(seed => fuzzExample("random updates to a list of elements", seed, elementItemView)),
  ...fragmentSeeds.map(seed => fuzzExample("random updates to a list of fragments", seed, fragmentItemView)),
])
