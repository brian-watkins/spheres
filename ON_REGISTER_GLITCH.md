# Register hook glitch

A register hook (`useHooks(store, { onRegister })`) can read a stale value when a container is
registered in the middle of an update.

This is related to the conditional-dependency glitch fixed with park-and-wait, but that fix doesn't
cover it.

## How it happens

A container is registered the first time its handler is looked up
(`WeakMapTokenRegistry.registerState`), and the register hook runs synchronously at that moment via
`joinBatch`. If the first lookup happens during the derivation phase of an update — a derived state
starts reading a container it was not reading before, because a condition changed — then the hook
runs while other derived states are still pending.

The hook's `actions.get` (`useHooks` in `src/store/store.ts`) is a one-shot `runQuery`:

```ts
get: (state) => {
  return runQuery(registry, (get) => get(state), batch)
},
```

That read doesn't subscribe and doesn't check `isPendingUpdate`. So if the hook queries a derived
state that will update later in the same update, it gets the old value, and whatever it does with it
(usually `actions.supply(...)`) is based on stale state.

## Example

```ts
const root = container({ initialValue: "off" })
const isOn = derived((get) => get(root) === "on")
const label = derived((get) => `${get(root)} label`)
const unregistered = container({ initialValue: "initial" })

const conditional = derived((get) => (get(isOn) ? get(unregistered) : "nothing"))

useHooks(store, {
  onRegister(container, actions) {
    if (container === unregistered) {
      actions.supply(`supplied from ${actions.get(label)}`)
    }
  },
})

// subscribe to `conditional` first, then to `label`, so `isOn` runs before
// `label` when `root` is written
```

Writing `"on"` to `root`:

1. `isOn` runs and becomes `true`, so `conditional` runs.
2. `conditional` reads `unregistered` for the first time. That registers it, and the hook runs.
3. The hook reads `label`, which is pending, so it gets `"off label"` and supplies
   `"supplied from off label"`.
4. `label` runs and becomes `"on label"`, but nothing re-runs the hook.

Expected: `conditional` ends at `"supplied from on label"`. Likely actual:
`"supplied from off label"`. **This hasn't been run yet.** The example is the starting point for a
failing test, probably in `behaviors/store/batchOnRegister.behavior.ts`, plus a batch version.

## Why park-and-wait doesn't fix it

Park-and-wait works because the reader is a `Subscriber`. It records the stale read, holds back its
notification, and gets woken when the pending dependency runs its subscribers. A register hook isn't
a subscriber, so nothing can wake it, and it isn't expected to run more than once per registration.

## Possible fixes

- **Pull for this read.** When the hook's `get` hits a pending reader, compute that reader's value
  right away, without notifying subscribers, and let the normal push deliver the notification later.
  This is the compute/notify split discussed when comparing pull with park-and-wait, but only needed
  for one-shot reads, which keeps it small. The pulled reader needs an "already ran in this update"
  marker so the later push doesn't recompute it.
- **Defer the hook until the derivation phase is done.** Register immediately (the derived state
  needs a handler to read), but queue the hook and run it once no derivation is pending — for
  example, alongside effects. The derived state that triggered the registration would read the
  container's initial value first and then update when the hook supplies a value. That's an extra
  intermediate value, but it's correct, and it's how a later write to the container would behave
  anyway. It changes when hooks run, which could matter to existing hook users. The comment in
  `useHooks` says supply/pending/error publish immediately because "there cannot be any subscribers
  to the container" yet, and deferring would make that no longer true.
- **Detect it and fail loudly.** At minimum, `get` could check `isPendingUpdate` and warn in
  development, so the glitch isn't silent.

## Unverified: a re-entrant batch apply

During a batch, the hook receives the batch that is currently publishing: `batchStack` still holds
it during `nextBatch.publish()`, and it's still open. `runQuery` calls `batch.apply()` when the
batch is open. A hook that calls `get` while that batch's subscribers are running would therefore
start a second `apply` in the middle of the first. `BatchPublisher.publishers` is only cleared at
the end of `apply`, so the second pass would prepare and run the same publishers again. Nothing in
the current tests covers a hook that calls `get` in this situation, so it's worth a test alongside
the one above.
