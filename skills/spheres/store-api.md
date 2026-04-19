# spheres/store — API Reference

State management that separates application logic (rules over state tokens) from the storage system (persistence, fetching, async I/O).

## Concepts

- **State Token** — a handle to a value managed by a `Store`. Four kinds: `Derived`, `Container`, `Supplied`, `Meta`.
- **Store** — holds values for registered tokens and processes `StoreMessage`s.
- **Storage system** — optional; defined via `ContainerHooks` (lifecycle hooks on a container) or `Commands` (explicit messages handled by a `CommandManager`).

## GetState

```ts
type GetState = <T, M>(state: State<T, M>) => T
```

A function that reads a token's current value. Only available inside reactive contexts: `derived` queries, `Stateful` bindings in views, `useEffect` functions, `CommandManager.exec`, `ContainerHooks` actions, and store `init`.

## State tokens

All token initializers accept an optional `name` for debug output (`token.toString()`).

### derived

```ts
interface DerivedStateInitializer<T> {
  name?: string
  query: (get: GetState) => T
}
function derived<T>(init: DerivedStateInitializer<T> | ((get: GetState) => T)): DerivedState<T>
```

A reactive calculation over other tokens. Recomputed when any read token changes.

### container

```ts
interface UpdateResult<T> {
  value: T
  message?: StoreMessage<any>
}
interface ContainerInitializer<T, M> {
  name?: string
  initialValue: T
  update?: (message: M, current: T) => UpdateResult<T>
}
function container<T, M = T, E = any>(init: ContainerInitializer<T, M>): Container<T, M, E>
```

Program input. Value changes via messages dispatched to the store. Without `update`, messages *are* the new values (type `M` = type `T`). With `update`, you define how incoming messages of type `M` transform the current value.

`container.meta` accesses the container's `Meta` token.

### supplied

```ts
interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
}
function supplied<T, M = any, E = any>(init: SuppliedStateInitializer<T>): SuppliedState<T, M, E>
```

Read-only values provided by the storage system. The `initialValue` is used until the storage system supplies another. Set `M`/`E` generics to type the meta state.

`supplied.meta` accesses the supplied state's `Meta` token.

### Meta state

```ts
interface PendingMessage<M> { type: "pending"; message: M }
interface OkMessage { type: "ok" }
interface ErrorMessage<M, E> { type: "error"; message: M; reason: E }
type Meta<M, E> = OkMessage | PendingMessage<M> | ErrorMessage<M, E>
```

Program authors don't create Meta tokens directly — they access them via `container.meta` / `supplied.meta` and read them in queries, effects, or views. Meta reflects the storage-system status of the underlying token.

## Store

```ts
interface StoreInitializerActions {
  get: GetState
  supply<T>(container: PublishableState<T>, value: T): void
  pending<T, M>(container: WithMetaState<T, M>, ...value: [M?]): void
  error<T, M, E>(container: WithMetaState<T, M, E>, reason: E, ...message: [M?]): void
}
interface StoreOptions {
  id?: string
  init?: (actions: StoreInitializerActions, store: Store) => Promise<void>
}
class Store {
  dispatch(message: StoreMessage<any>): void
  initialized: Promise<void>
}
function createStore(options?: StoreOptions): Store
```

- `id` — identifies the store; needed when serializing multiple stores.
- `init` — async initialization. `supply`, `pending`, `error` set values and meta state before the app runs. Await `store.initialized` to know when init has completed.

## Store messages

Factory functions that build `StoreMessage` values for `store.dispatch` (or for returning from view event handlers).

### write

```ts
write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M>
```

Send a message to a container.

### update

```ts
update<T, M = T>(container: Container<T, M>, generator: (current: T) => M): UpdateMessage<T, M>
```

Compute the message from the container's current value.

### reset

```ts
reset<T, M = T>(container: Container<T, M>): ResetMessage<T, M>
```

Restore the container's `initialValue`.

### run

```ts
run(effect: () => void): RunMessage
```

Run an arbitrary function. Most useful inside a `batch` to sequence a side effect between message applications.

### batch

```ts
batch(messages: Array<StoreMessage<any>>): BatchMessage
```

Apply many messages as one update. Effects depending on multiple changed values fire only once.

### use

```ts
use(rule: (get: GetState) => StoreMessage<any> | undefined): UseMessage
```

Build a message from current state. The generated message is dispatched immediately after the `UseMessage` is processed.

## Configuring the store

### useHooks — store-level lifecycle

```ts
interface RegisterHookActions {
  get: GetState
  supply(value: any): void
  pending(value?: any): void
  error(reason: any, value: any): void
}
interface StoreHooks {
  onRegister(container: Container<any>, actions: RegisterHookActions): void
}
function useHooks(store: Store, hooks: StoreHooks): void
```

Runs once per container when it's first registered with the store. Useful for attaching `ContainerHooks` at runtime.

### useContainerHooks — per-container lifecycle

```ts
interface WriteHookActions<T, M, E> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(reason: E, value: M): void
  current: T
}
interface ContainerHooks<T, M, E = unknown> {
  onWrite?(message: M, actions: WriteHookActions<T, M, E>): void
}
function useContainerHooks<T, M, E>(store: Store, container: Container<T, M>, hooks: ContainerHooks<T, M, E>): void
```

`onWrite` runs every time a message is written to the container. Use it to persist the message, set meta state, or transform the value before it lands.

### command + useCommand

```ts
interface CommandInitializer<M> {
  trigger?: (get: GetState) => M
}
function command<M>(init?: CommandInitializer<M>): Command<M>

interface CommandActions {
  get<T, M>(state: State<T, M>): T
  supply<T, M, E>(state: SuppliedState<T, M, E>, value: T): void
  pending<T, M, E>(state: SuppliedState<T, M, E>, message: M): void
  error<T, M, E>(state: SuppliedState<T, M, E>, reason: E, message: M): void
}
interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}
function useCommand<M>(store: Store, command: Command<M>, handler: CommandManager<M>): void
```

Commands are messages from app logic to the storage system. Invoke with `exec(command, message)` via dispatch. If `trigger` is provided, the command fires automatically whenever the reactive query produces a new message.

The handler can read tokens, set values and meta on `SuppliedState`, and dispatch further store messages (capture a reference to the store at registration time).

### useEffect

```ts
interface ReactiveEffect {
  init?: (get: GetState) => void
  run: (get: GetState) => void
}
interface ReactiveEffectHandle {
  unsubscribe(): void
}
function useEffect(store: Store, effect: ReactiveEffect): ReactiveEffectHandle
```

`init` runs once when the effect is registered. `run` fires reactively when any token read inside it changes. Returns a handle you can `unsubscribe()` to stop the effect.

## Persistence pattern (localStorage)

```ts
const counter = container({
  initialValue: 0,
  update: (msg: "increment", current) =>
    msg === "increment" ? { value: current + 1 } : { value: current }
})

const store = createStore({
  init: async ({ supply }) => {
    supply(counter, Number(localStorage.getItem("counter") ?? 0))
  }
})

useEffect(store, {
  run: (get) => localStorage.setItem("counter", String(get(counter)))
})
```

## When to reach for what

| Need | Use |
|------|-----|
| Mutable app input | `container` |
| Read-only value derived from others | `derived` |
| External data loaded into the store | `supplied` + `init` or `command` |
| Track pending/error status of async ops | `container.meta` / `supplied.meta` |
| Persist a container on every write | `useContainerHooks` with `onWrite` |
| Trigger external calls from state changes | `command` with `trigger`, or `useEffect` |
| Side effect (log, persist, notify) reactive to state | `useEffect` |
| Dispatch many messages as one update | `batch` |
