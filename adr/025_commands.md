# Commands and Supplied State as part of application logic

So far, we've just tried to represenbt application logic in terms
of the relationships among pieces of state -- derived values and
input containers. But in [this ADR](./016_query_and_selection.md),
we discussed a problem that this posed, namely, the case of a value
that must be calculated by some mechanism other than the web app
itself. In that ADR, we suggested that by adding a message type and
a reducer to a Value, we could support this case. A Writer would need
to be added to the Value and when a certain message comes in, the writer
could generate the value and then pass it on to be published.

There are a few downsides to this approach:
1. A Value has to have a Writer attached to it -- Values should simply
be derived from some calculation on existing state. A Value type was used
here to signal that the value is read-only and should not be written to
like a normal container.
2. The message that indicates the value should be calculated could
not be resolved in any meaningful way by the reducer function. So, the
only approach would be to throw an error if it were received at runtime.

This suggest a few problems:
1. We currently have no way to represent state that is read-only from the
perspective of the application but which might be set by the storage
mechanism (broadly construed).
2. We have no way to represent messages that must be sent to the storage
mechanism as part of the application logic. One could think of this like
a SQL select statement -- that's a message that tells the storage mechanism
to get some data and return it. But currently we can only represent user
input (via containers) or state derived from that.

## Decision

We will add two concepts to the application logic: Commands and SuppliedState.

A `Command` has a message associated with it, which describes details that the
command needs to operate. A `Command` can be executed either by sending an `exec`
message to the Store or through a reactive query that is associated with it, and
which generates the required message when state is updated.

A `Command` will be registered with the store and associated with a `CommandManager`.
The manager is an object with an `exec` function that takes the incoming message
and does whatever should be done. The `exec` function has special capabilities
to set the value of `SuppliedState` or get existing state values. A `CommandManager`
can also dispatch messages to the Store by capturing a reference to the Store
itself when it is created.

`SuppliedState` is read-only application state with some initial value that is
governed by some `Command`. The relevant `CommandManager` can set its value or
its pending and error meta states. We use `SuppliedState` when we want to signal
that some state is not the direct result of user input or merely derived from
other state.

### When to use Commands and SuppliedState

We should think of state in terms of three categories:
1. Input
2. Derived
3. Supplied

Input state is what we've been representing mainly by containers. We may change the
name to make its role more obvious. Input state is state that can be managed
purely 'locally' without need for any storage mechanism at all. Such state may be
persisted, but the application logic should be completely oblivious to whether this
is happening or not. Note that in the problem described above, we had a case where
a container needed to process a message that actually could not be processed in a
meaningful way (and so an error needed to be thrown) -- this is a signal that we were
not dealing with input state but something else (supplied state). Input state should
only update due to a user interaction or some mechanism that dispatches a write message
to the store (like a command), or if the storage mechanism loads previously persisted
values.

Derived state is state that is the result of a calculation on other existing state.
Derived state should update whenever any of the values in that calculation change.

Supplied state is state that comes from the storage mechanism, broadly construed.
It is governed completely by the storage mechanism and cannot be mutated due
to user input. Supplied state is updated by a CommandManager, and so the way to
affect supplied state is to execute a command (which is generally done in response
to some user input). Supplied state has no storage handler associated with it like
a container can. This is because the storage mechanism governs its values in any case.

Some examples of supplied state:
- a value that must be calculated on the server-side but which depends on values
input on the client side
- time values
- messages received on a websocket
- browser history updates

So, in general, one should use a command when some state depends on some fact
about the outside world. The result of that command can be supplied state but it
may also be user input state in certain cases.
