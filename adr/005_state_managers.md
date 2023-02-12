# State Managers

We've already talked about atomic state. But state in a web application typically
does not exist all in memory. We need a way to store state that the application
receives via user input, and, often, we need a way to read data from storage to
present to the user. One goal is to /decouple/ the notion of storage from the
state graph. The hypothesis is that by separating the work of storage (reading
and writing) from the representation of state in the application, we can simplify
the development of that application.

### Refreshes and Writes

We will think about state updates in two ways, based on where a state update originates.
Some state updates (call these "refreshes") are due to dependent values updating
-- this occurs when some state is derived from other state values. One could
imagine also that state could be updates due to fetching that data from some
storage (aka the server), even periodically. Other state updates (call these
"writes") are due to input from a user, via the user interface.

We will say that a refresh occurs "inside" the state graph -- mainly because
the basic example of these is just a propagation of updated state value to
other state that is derived from it. But also because if we think of a refresh
as involving reading data from storage, these are explicitly values that do
not need to be stored. Writes, on the other hand, may need to be stored and
so we distinguish these from refreshes.

When a refresh occurs, it immediately updates the value of the state and any
subscribers to that state are notified of the new value. When a write occurs,
we may invoke a special function that does any storage of the value. The end
result of that process is a command to refresh the value of the state to which
something has been written. In that sense, a refresh is the primary, immediate
way to update state. A write may be mediated by some (potentially asynchronous)
function that performs a storage action before issuing the command to refresh
the value -- and thus the value written may be transformed in the process.

### Providers and Writers

We want to decouple refreshes and writes from the state graph. To do so, we'll
introduce two concepts: `Providers` and `Writers`.

A `Provider` is an object with a `provide` function, which takes two arguments,
a `get` function that allows access to any state and a `set` function that allows
refreshing any state. State values that are requested via the `get` function
will thereafter trigger the provider again whenever their state changes. So,
providers are reactive on the states referenced via `get` in the `provide`
function.

Note that a `Provider` is not necessarily associated with any state in particular.
This allows us to decouple how state is stored from how it is represented
in the application. For instance, we might have a variety of state concepts
and the tendency might be to store these using a RESTful API, with one request
for each one. By using a `Provider` we could fetch all the data using one request
and then refresh each of the individual state containers with the appropriate
values.

A `Writer` is an object with a `write` function that takes the value to write, a
`get` function that can get the value for any state, and a `set` function that
sets the value of the state to be written. Unlike a `Provider` a `Writer` is
associated with a particular state object. When write messages are dispatched to
the loop for that state, the `write` function on any associated writer will be
invoked. That function can access any state values via the `get` function, but
unlike a `Provider` the write function is not triggered by subsequent updates to
those state objects. A `Writer` would typically take the incoming value to be
written, store it leveraging any other necessary state, and then use the `set`
function to refresh the state with the stored value. The `Writer` can transform
the value through this process -- for example, a stored value might get an id
or something through the process of storage.

Each container can only have one `Writer` associated with it. We might want to
consider making this more clear in the API by calling the function used to
register a writer `setWriter` or something like that.

### Caveats

In order to decouple the representation of application state from the mechanism
by which it is stored, when we describe the application state we
cannot reference the providers that manage refreshing that state or the writers
that manage storing it. Instead, we reference the appropriate state when we define
the providers and when we register a writer. While this approach
allows us to achieve the decoupling we want, the downside is that it's not clear
what provider or writer might be associated with a particular piece of state just
by looking at the description of that state. One way around this downside would be
to use the 'find usages' feature of an IDE to locate the providers that reference
a particular state object.

Another issue: Currently, when we create a state or a container, we must provide
an initial value -- either in the form of an explicit value or in the form of a
derivation from other state. But for a container or state that is refreshed by a
`Provider` this can be really cumbersome. We would need to either create some
junk state or replicate the first state that the provide will provide. Either would
require more knowledge of how the provider works, at least a bit. Instead, what
we might want to do is allow a container or state to be initialized with something
that indicates that it's value will be provided later. The trick is that any state
that depends on this must also now wait to provide it's value until that original
state gets one. This is fine for most cases, but it makes derived state a bit
trickier since we need to determine that one or more dependencies are deferring
their state and so we should make the derived state deferred as well. We will
experiment with this to see if it's feasible.