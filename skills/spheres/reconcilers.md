# Reconcilers

```ts
import { reconcileArray, reconcileObject, useCurrent, useNext } from "spheres/store/reconciler"
```

A reconciler decides, when a token is about to take a new value, how much of the **old** value to keep. It exists to answer one question: *did this actually change, and if so, which parts?*

```ts
type Reconciler<T> = (current: T, next: T) => T
```

Attach one to any `container`, `derived`, or `supplied` token:

```ts
const visibleItems = derived({
  query: (get) => get(allItems).filter(item => !get(hidden).has(item.id)),
  reconciler: reconcileArray({
    key: item => item.id,
    itemReconciler: reconcileObject<Item>()
  })
})
```

## The contract

The value returned from the reconciler is compared to the current value of
the state token with `Object.is`:

- **Return `current`** → the token does not publish. No listener runs, no binding updates, no DOM is touched.
- **Return anything else** → that becomes the token's value and listeners run.

So a reconciler is not a formatter or a validator — it never invents values. It only chooses between things it was handed, and the *reference identity* of what it returns is the entire signal.

## Why you want one

Two distinct payoffs:

**Suppressing spurious updates.** A `derived` query that ends in `.filter()`, `.map()`, or an object literal builds a fresh value every time any upstream token changes — even when the result is equivalent. Without a reconciler that publishes on every upstream change. With one, an unchanged result is silently dropped.

**Preserving identity for `subviews`.** `subviews` keys its diff on the item value itself, so a rebuilt array of equivalent-but-new objects looks like a wholesale replacement and every row is rebuilt. A reconciler that carries the old element objects forward means only genuinely changed rows do any DOM work.

The second is usually the bigger win, and it's why matching by key matters: an item that *moved* should still be recognized as the same item.

## reconcileArray

```ts
interface ReconcileArrayOptions<T> {
  key?: (item: T) => ItemKey
  itemReconciler?: Reconciler<T>
}
function reconcileArray<T>(options?: ReconcileArrayOptions<T>): Reconciler<Array<T>>
```

`reconcileArray` builds a result array, then checks whether that result is the same as the current array.

**1. Building the result: `key` chooses each element's counterpart.** Every element of the next array is paired with an element of the current array, and the `itemReconciler` decides what goes into the result. An `itemReconciler` that finds the two elements equivalent returns the current element, so the old reference goes into the result. Otherwise the result gets a new object. How the pair is chosen depends on `key`:

- **Without `key`**, the counterpart is the current element *at the same index*. Once anything shifts, that is usually a different item, so the pair doesn't match and the new object is kept.
- **With `key`**, the counterpart is the current element *with the same key*, wherever it sits. A moved item is still paired with its old self, so its old reference can carry into the new array.

Elements with no counterpart are new and pass through untouched. Elements sharing a key are matched one for one in order, so a duplicated key never hands the same element out twice.

**2. Deciding whether the array changed: checked by position.** The result is compared with the current array index by index, by reference. So "equivalent" is decided in step 1 by the `itemReconciler`, and step 2 only checks whether each equivalent element ended up at the same index. If every element of the result is the same reference as the current element at that index, the reconciler returns `current` and the token does not publish. Because of that position check, a reorder, insert, or removal **always** publishes, with or without `key`.

Example: the list is refetched and `X` is inserted at the front. `A'`, `B'`, `C'` are new objects equal to `A`, `B`, `C`.

```
current: [A, B, C]
next:    [X, A', B', C']

{ itemReconciler }        → [X, A', B', C']  pairs (A, X), (B, A'), (C, B') — nothing matches, every row rebuilt
{ key, itemReconciler }   → [X, A, B, C]     pairs (A, A'), (B, B'), (C, C') — only X is new
```

Both return a new array, so both publish. Only the keyed version lets `subviews` move three rows and create one, instead of rebuilding all four.

The four combinations:

| Options | Counterpart found by | On a match |
|---|---|---|
| `{}` | — | keeps the whole array when nothing moved |
| `{ key }` | key lookup | keep the current element, **ignoring any changes to its content** |
| `{ key, itemReconciler }` | key lookup | hand the pair to `itemReconciler` |
| `{ itemReconciler }` | position | hand the pair to `itemReconciler` |

```ts
// collapse a rebuilt-but-unchanged array
reconcileArray()

// carry elements across a reorder, insert, or removal,
// and reuse the unchanged fields of a changed element
reconcileArray({
  key: item => item.id,
  itemReconciler: reconcileObject<Item>()
})

// elements never move; pair them by position
reconcileArray({ itemReconciler: reconcileObject<Item>() })
```

**Don't use `{ key }` alone unless an item's content never changes once it has a given key.** With no `itemReconciler`, the default is `useCurrent`, so a match always keeps the old element. `[{ id: 1, done: false }]` → `[{ id: 1, done: true }]` returns `current`, and the token does not publish. If items with the same key can change, pass an `itemReconciler`.

### ItemKey

```ts
type ItemKey = string | number
```

Keys are compared as `Map` keys.

## reconcileObject

```ts
type FieldReconcilers<T> = { [K in keyof T]?: Reconciler<T[K]> }
function reconcileObject<T extends object>(fields?: FieldReconcilers<T>): Reconciler<T>
```

Reconciles field by field, then keeps the current object if every field came out unchanged.

```ts
reconcileObject<Post>({
  author: reconcileObject<Author>(),
  tags: reconcileArray<string>()
})
```

**A field with no declared reconciler is compared by reference.** Nested values that were recreated with equal contents are treated as changed unless you say how to compare them — there is no implicit deep equality. `reconcileObject()` with no fields is therefore a shallow reference comparison, which is exactly what you want as an `itemReconciler` for records of primitives.

Adding or removing a field counts as a change even when every remaining field matches.

## useCurrent and useNext

```ts
const useCurrent: Reconciler<any>   // (current, next) => current
const useNext: Reconciler<any>      // (current, next) => next
```

Building blocks for the slots above. `useCurrent` is the default `itemReconciler`, and as a field reconciler it pins a field against updates:

```ts
// fontSize is set once and never changes again
reconcileObject<Settings>({ fontSize: useCurrent })
```

## Composition

The two combinators nest, because each returns a plain `Reconciler`:

```ts
const reconcileGroups = reconcileArray<Group>({
  key: group => group.id,
  itemReconciler: reconcileObject<Group>({
    messages: reconcileArray<Message>({
      key: message => message.id,
      itemReconciler: reconcileObject<Message>()
    })
  })
})
```

Reorder the groups and edit one message, and what comes back is: untouched groups by reference, a new object only for the group that changed, its unchanged messages by reference, and a new object only for the edited message.

## When not to bother

- **Primitives.** `Object.is` already short-circuits numbers, strings, and booleans.
- **Values you rebuild wholesale anyway.** If every element genuinely changes on every update, a reconciler adds work and reuses nothing.
- **Small arrays that never reorder.** The default `Object.is` check on the array reference is cheaper than any reconciler; reach for one when you have measured redundant updates or redundant `subviews` rebuilds.

Reconcilers cost a pass over the data on every update. They pay for themselves when the data is large, rebuilt often, and mostly unchanged — which is the common shape for a filtered or mapped `derived` list feeding `subviews`.
