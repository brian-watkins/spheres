#  Contain State Values within a Store

Up until now we've been working with something we referred to as
the Loop to track state values. The Loop was a global variable defined
in a module. When we created a container or derived state, we would
call some function that implicitly registered that state with the global
loop. Also, each piece of state exposed a `subscribe` function that
would allow anyone who wanted to listen to updates for that state to
register for them. This would implicitly interact with the global loop
to make this happen.

There are a few downsides to this approach. First of all, it doesn't feel
all that great to have the core functions to create state generating lots
of side effects. In addition, with one global loop, we are essentially
treating all state as global; this has drawbacks for testing at least, when
we might want to reset the state. Finally, it's not possible to have
areas of the app that track their state independently of others. In order to
make that happen, one would need to create distinct pieces of state for
both areas.

What we'd like to do is be able to provide some container for state values
whenever we want -- during a test or as part of the configuration at start up
time for an app. And we'd like to be able to preserve what's probably the
best part of our approach so far, namely, that it's possible for the app
to reference state via module imports and get all the type information that
characterizes that state.

One possible approach might be to keep our API for creating state the same
and just add an optional parameter for a `Loop` object to use. This might work,
but it would (I think) mean that we'd need to create those state objects as
part of some function that took the `Loop` as a parameter -- kind of like
the dependency injection pattern. But then we'd lose the ability to simply
import pieces of state -- we'd have to pass around the pieces of state after
they've been configured with some loop, injecting them wherever they were
needed. For this reason, this does not seem like a promising approach.

Instead, we will change our API slightly. We will treat what we've been calling
a 'piece of state' as instead a *token* for some state. When that token is
associated with a particular *store* it will have some value. A *state token*
is itself nothing more than an identifier. It only stores information necessary
to bootstrap its initial value whenever it is associated with some store. This
information would be: some actual value, a function that specifies how to derive
that value, given other state tokens, etc. The state token will also allow
access to its *meta state token* via a `meta` property. The meta state token will
also be just an identifier, but one that carries information about the state
of the state it's associated with.

The `Store` will be a class that's instantiated whenever we need to have state
values. The `Display` will take a `Store` as an argument upon construction so
that it can dispatch messages to it. It will also use this store to register
derived state for views. The `Store` will expose methods for registering
providers and writers. Finally, in all these cases, whenever the `Store`
encounters a reference to a state token, it must register that state token with
it so that it has a value within that store. In order to subscribe to state
updates, one must subscribe via a particular store, passing the token and the
function that will be called upon updates.

By being explicit about the Store, we will decrease the amount of magic side
effects that happen, and we will make it trivial to have multiple pockets of
independent state (that use the same state tokens) or to reset all state.