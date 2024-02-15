# @spheres/store

Separate application logic from state storage details to write simpler programs.

## Introduction

`@spheres/store` asks you to think of your program from two perspectives. First,
think of the application logic -- all the variables and rules and relationships
among program state -- then think of how that state is stored.

### Application Logic

First, think of your program as a set of rules expressed
in terms of *State Tokens*. A State Token is an object that contains information
about a value. When a State Token is registered with a Store, that token
will come to represent a particular value, which may (or may not) change
over time.

There are four kinds of State Token: Derived state, Containers, Supplied state,
and Meta state.

**Derived State** represents the result of a *reactive* calculation on
the values represented by other State Tokens. That is to say, if any of the
values represented by the State Tokens composing this calculation change,
then the value represented by the Derived State Token will also change.

**Containers** represent program *input*. All containers have an initial
value, and the value they represent changes as *messages* referencing the
container are written to the Store. The simplest message is just a new
value of the appropriate type, but containers may have a reducer function
that takes a message of some type and generates a new value based on the
current value. Containers may also have reactive constraints that produce new
messages based on the values represented by other state tokens.

**Supplied State** represents read-only values that are supplied by
the storage system, with the exception of an initial value that is
supplied as part of the Supplied State definition.

The *storage system* refers to some mechanism by which state is fetched
and persisted. The implementation details of the storage system are defined
independently of the application logic. We'll get to that in one moment.

**Meta State** represents a value that describes the current state of some
Supplied State or Container, with respect to the storage system that governs it.
Meta State has three possible values: `ok`, `pending`, `error`. So, if the
message written to a container is currently in the process of being
persisted by the storage system, the container's meta state will be `pending`.
If the storage system fails to persist the message, then the meta state
will be `error`; if it succeeds, the meta state will be `ok`. Meta State can
be referenced in reactive calculations just like any other State Token.

### Storage System

Most programs rely on some sort of system that facilitates loading
state from the world outside the program -- this could be any thing
from random values, to the current time, to domain specific content,
to state that was generated during a previous program run and persisted
for future use. We will refer to this system as the *storage* system,
even though it may provide values that are not technically 'stored',
because most of the time this system exists to provide the program
with a mechanism for persisting data between program runs.

A program using `@spheres/store` need not define any details about
a storage system and it would work just fine. Such a program would begin
with a set of state tokens, all representing some initial value. Changes
in program state would occur by writing messages to the store that change
the values represented by containers. Program state would remain in
memory; once the program ends, it would be lost.

`@spheres/store` offers two methods for defining implementation details
for the storage system.

First, `ContainerHooks` offer the ability to
run storage mechanisms when a Container is first registered with the
Store and each time it receives a new message. These storage mechanisms
can set the Meta state of the container and eventually, after the mechanism
is complete, pass on a value to be represented by the container.

Second, a `Command` is a special token that defines a message that can be
sent directly to the storage system and handled by a `CommandManager`. A
`CommandManager` can set the Meta state and provide values to any Supplied
State.

Storage system details are defined on the store via the `useContainerHooks`
and `useCommand` methods.

## An Example

Consider a counter app. We could represent the logic of this program with
one Container that starts with an initial value of 0 and has a reducer function
that increments the count when receiving an `increment` message.

```
const counter = container({
  initialValue: 0,
  reducer: (message, current) => {
    if (message === "increment") {
      return current + 1
    } else {
      return current
    }
  }
})
```

When we want to update the container, we write a message referencing
the counter to the store.

```
const store = new Store()
store.dispatch(write(counter, "increment"))
store.dispatch(write(counter, "increment"))
store.dispatch(write(counter, "increment"))
```

Now the value represented by the counter token will be 3. But how do we
do anything with this value? We can define an *effect* on the store that
logs the current counter value:

```
store.useEffect((get) => console.log(`Count: ${get(counter)}`))
```

Now, each time the store receives a new message to increment the counter,
the effect will run and print the new counter value to the console.

Great! We have a counter app, but the counter value will be lost when the
program ends. We can fix that by adding details about a storage system.
We'll use local storage to persist the counter value:

```
store.useContainerHooks(counter, {
  onReady: ({ supply }) => {
    supply(Number(localStorage.getItem("counter-value")))
  },
  onPublish: (value) => {
    localStorage.setItem("counter-value", value.toString())
  }
})
```

The container hooks provide an opportunity to perform some storage effect
at various parts of the container lifecycle. The `onReady` hook is called
when a container is first registered with the store. The `onPublish` hook
is called with the value represented by the container, whenever that value
changes. By using these hooks, we can add persistence via a browser's
localStorage without changing the logic of our application.


## API

### Get State Values

```
type GetState = <T, M>(state: State<T, M>) => T
```

The `GetState` type refers to a function that can be called with a state
token to get its value. It is used throughout the API.

### State Tokens

Use `derived`, `supplied`, and `container` to create state tokens. Each function
takes an initializer with token-specific properties. All token initializers share
two optional properties: `id` and `name`. 
- Set the `id` property to make the relevant token generating function idempotent.
That is to say, usually `container` will generate a new token each time it is
called. But if you supply an `id` property, then every time you call this function
with the same `id`, you will get a token that represents the very same value in
the store.
- Set the `name` property to identify the token for debug purposes. The value of
`name` will be included in the result of `token.toString()`

Token specific initializers are explained below:

#### Derived State

```
interface DerivedStateInitializer<T> {
  id?: string
  name?: string
  query: (get: GetState, current: T | undefined) => T
}

function derived<T>(initializer: DerivedStateInitializer<T>): DerivedState<T>
```

The `query` attribute is required and defines a *reactive* calculation on
other state tokens. This calculation will be run any time one of the referenced
state tokens come to represent a new value.

#### Meta State

Meta state is of type `State<Meta<M,E>>` where the `Meta` type is defined as follows:

```
interface PendingMessage<M> {
  type: "pending"
  message: M
}

interface OkMessage {
  type: "ok"
}

interface ErrorMessage<M, E> {
  type: "error"
  message: M
  reason: E
}

type Meta<M, E> =  OkMessage | PendingMessage<M> | ErrorMessage<M, E>
```


#### Supplied State

```
interface SuppliedStateInitializer<T> {
  id?: string
  name?: string
  initialValue: T
}

function supplied<T, M = any, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, M, E>
```

Set the `M` and `E` types in order to properly type the supplied state's Meta state.

`SuppliedState` has one attribute: `meta` that provides access to the state's meta token.


#### Container

```
interface ConstraintActions<T> {
  get: GetState,
  current: T
}

interface ContainerInitializer<T, M> {
  id?: string,
  name?: string
  initialValue: T,
  constraint?: (actions: ConstraintActions<T>, next?: M) => M
  reducer?: (message: M, current: T) => T
}

function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E>
```

Define a reducer if this container should accept messages of type `M` that it
will convert to values of type `T`. A reducer is optional.

Use the optional `constraint` property to define a *reactive* calculation
that will run to produce a message that is sent to the container any time
any of the referenced state tokens comes to represent a new value. The constraint
function will also be run any time a message is dispatched to the store that
references this container.

`Container` has one attribute: `meta` that provides access to the state's
meta token.


### Store

```
class Store {
  useHooks(hooks: StoreHooks)
  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>)
  useCommand<M>(command: Command<M>, handler: CommandManager<M>)
  useEffect(effect: Effect): EffectHandle
  dispatch(message: StoreMessage<any>)
}
```

These functions will be explained below:


### Hooks

Use hooks to interact with the lifecycle of a container.

#### StoreHooks

```
interface StoreHooks {
  onRegister(container: Container<any>): void
}
```

Register `StoreHooks` via the `useHooks` store method in order to run
some function whenever a container is registered with the store. This
is useful to attach `ContainerHooks` at runtime.


#### ContainerHooks

```
interface ReadyHookActions<T, M, E> {
  get: GetState
  supply(value: T): void
  pending(value: M): void
  error(value: M, reason: E): void
  current: T
}

interface WriteHookActions<T, M, E> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(value: M, reason: E): void
  current: T
}

interface PublishHookActions {
  get: GetState
}

interface ContainerHooks<T, M, E = unknown> {
  onReady?(actions: ReadyHookActions<T, M, E>): void
  onWrite?(message: M, actions: WriteHookActions<T, M, E>): void
  onPublish?(value: T, actions: PublishHookActions): void
}
```

Register `ContainerHooks` for a particular Container via the Store's
`useContainerHooks` method.
- The `onReady` hook is run the first time this `ContainerHooks` object
is registered with a particular Container. Use the `onReady` hook to
supply a value to the container or set's the container's meta status on
app startup.
- The `onWrite` hook is run whenever a *message* is written to the container
either by dispatching a message to the Store or whenever the container's
`constraint` generates a new message. The `onWrite` hook is not called
when the `onPublish` hook supplies a value for the container.
- The `onPublish` hook is run whenever a new *value* is published as a
result of processing some message written to the container. The `onPublish`
hook is not called when a value is supplied by the `onReady` hook, but
otherwise it is.


### Commands

Commands are used to represent messages that must be sent from the application
logic to the storage system.

Generate a command using the `command` function:

```
interface CommandInitializer<M> {
  trigger?: (get: GetState) => M
}

function command<M>(initializer: CommandInitializer<M> = {}): Command<M>
```

A command typically just serves as a way to capture type information
about the message (the `M` type) that must be passed when invoking it
with the `exec` StoreMessage.

Use the optional `trigger` attribute to define a *reactive* query that will
run to invoke the command with the resulting message every time one of the
referenced state tokens comes to represent a new value.

Call the `useCommand` function on the Store to register a `CommandManager`
for a particular `Command`.

```
interface CommandActions {
  get<T, M>(state: State<T, M>): T
  supply<T, M, E>(state: SuppliedState<T, M, E>, value: T): void
  pending<T, M, E>(state: SuppliedState<T, M, E>, message: M): void
  error<T, M, E>(state: SuppliedState<T, M, E>, message: M, reason: E): void
}

interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}
```

A `CommandManager` implements one method, `exec`, that is called whenever the
associated command is invoked. A `CommandManager` can get the value of other
state tokens, and set the value or meta status of SuppliedState.

A `CommandManager` may dispatch arbitrary messages to the Store by capturing
a reference to the Store and calling `dispatch` explicitly.


### Effects

```
export interface EffectSubscription {
  unsubscribe(): void
}

interface Effect {
  onSubscribe?(subscription: EffectSubscription): void
  init?(get: GetState): void
  run(get: GetState): void
}
```

Register an `Effect` with the Store via the `useEffect` method. The optional `onSubscribe`
function will be called with an `EffectSubscription` that allows for unsubscribing the
Effect, if necessry. An `Effect` implements an optional `init` function and a required `run`
function that defines a *reactive* query. The `init` function is run after `onSubscribe`
when the Effect is registered with the store via `useEffect`. The `run` function will be
executed anytime the state tokens referenced in the definition come to represent a new value.

Use `Effects` to perform side effects on state changes.


### Store Messages

Use the Store's `dispatch` method to send messages to the Store. There are
several kinds of messages:

#### WriteMessage

```
write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M>
```

Generate a `WriteMessage` with the `write` function. Use this to send a
message to a Container.

#### ResetMessage

```
reset<T, M = T>(container: Container<T, M>): ResetMessage<T, M>
```

Generate a `ResetMessage` with the `reset` function. Use this to reset
a Container to its initial value.


#### RunMessage

```
run(effect: () => void): RunMessage
```

Generate a `RunMessage` with the `run` function. Use this to run an
arbitrary function. Useful to sequence changes when using BatchMessages.


#### BatchMessage

```
batch(messages: Array<StoreMessage<any>>): BatchMessage
```

Generate a `BatchMessage` with the `batch` function. Use this to dispatch
many messages to the Store at once. The messages will be processed by the
Store in the sequence specified.


#### Rules

```
function rule<Q = undefined>(definition: (get: GetState, inputValue: Q) => StoreMessage<any>): Rule<Q>

type RuleArg<Q> = Q extends undefined ? [] : [Q]

function use<Q = undefined>(rule: Rule<Q>, ...input: RuleArg<Q>): UseMessage
```

Create a `Rule` with the `rule` function. A Rule is invoked with some optional
argument by dispatching a `UseMessage` (generated with the `use` function)
to the Store.

A Rule can reference the values of other State Tokens but it is *not*
reactive. Use a Rule to generate a StoreMessage when that message depends
on the values represented by some State Tokens.
