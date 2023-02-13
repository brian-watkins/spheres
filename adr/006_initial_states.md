# Initial States

As mentioned in the [ADR on state managers](./005_state_managers.md), for state
whose value is managed by a `Provider`, it might feel cumbersome to define its
initial state -- since the `Provider` will presumably provide an initial value
on its own soon enough.

We considered a few options:

### 1. Do not provide an initial value

Here we would have some kind of state initializer like `withValueProvidedLater()`
or something. The problem here is that it seems like if we have no initial value,
then we cannot allow dependent state to have a value either. Besides the question
of how best to implement this, it follows that if we're building an app with a
display, then portions of that display would have no value (until the provider
provides a value). But this means that portions of the display would simply not
render at first.

### 2. Do not provide an initial value and implement suspense

React has a way to automatically handle async loading situations using the
`Suspense` component. We could build something like that into the display so that
the display would render a different function if there were no value. Or we
could somehow allow state to determine that one or more of its dependencies were
at the moment undefined and provide some other value instead. This seems like a
very large adjustment to the API though ... as every single value would need to
be wrapped with some meta data that determined whether it was available or not --
or alternatively we could allow every value to be undefined. But that's
probably much more cumbersome to deal with than to provide an initial value
sometimes.

### 3. Provide some standard types for state that is managed by a Provider

We could define some standard types like `Loading`, `Loaded`, `Error` etc,
and every state that is managed by a provider would use those types (which could
be generic over the value they wrap). That way, if we signaled that a state
was managed by a provider and thus had this type, we could set its initial
state to `Loading` automatically.

The problem though is that not all `Providers` are asynchronous. A `Provider`
that fetches data from local storage, for example, does not need to have
a `Loading` state. So it seems like it's better to allow the use case to
determine the type of state.

### 4. Simply define the initial state

We could simply define an initial state and set it explicitly when creating
state, even if that state will be managed by a `Provider`. 

In order to do this in a nice way, we should define the *type* of state in
the same file that we *create* the state. Or, in other words, we should
define the *type* of state in the same area of the app that we are creating
the representation of application state -- and not in the area of the app
where providers are defined. That way, the type of the state will be part of
the representation of application state in general -- and we'll avoid any
potential dependency cycles (where the provider needs to reference the state
but the state needs to reference a type definition in the file with the
provider).

One downside to this approach is that we might set the initial state to
`Loading` but then the mechanism of the `Provider` is to first set the state
to `Loading` as well. This could cause downstream refreshes on our current
implementation.

## Decision

We will go with option (4). We will always require initial state to be set
explicitly when creating state. But if we keep in mind that the representation
of application state should include the type definitions for that state, then
it doesn't seem all that problematic.

### Caveat

We probably need to look into making sure that a `Provider` does not set a value
on a state if it's the same as the state's current value, so that we prevent
excessive downstream refreshes.