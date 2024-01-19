# Meta State Errors are not triggered by exceptions

At one point we tried adding in some exception handling to catch exceptions
thrown at points in the process of handling state: when a derived state is
initialized, when a derived state updates, when a container reducer is run,
when a message is written to the store, etc ... And in most of these cases, we
attempted to update the meta state error value for the relevant state token.
But this is not a good strategy at all.
- If you intend to convey specific error values to the application logic, one
could leverage a thrown exception to pass information to the meta state as we had
enabled. However, in Javascript/Typescript we lose type information when
we throw a value, so this means that any type guarantees are just wishful thinking.
- In addition, this only "works" if you *intend* to pass information this way.
But if an unexpected exception is thrown, then it would also be caught and
update the meta state ... but then the exception would be effectively swallowed
unless someone happened to be subscribed to the meta state and looking for
error values ...
- And, even then, the meta state error value would probably have an unexpected
type, causing another exception later on.

## Decision

So, we will remove all exception handling from the store for now.

The meta state is *only* for conveying information about storage activities
to the main application logic. And since only input state and supplied state
can be updated by the storage mechanism, then only input state and supplied
state should have meta state at all.

This means it will no longer be possible to access the meta state of a
derived state or of a meta state itself.

And if some aspect of the storage mechanism needs to convey error information
to the application logic, then this should be done via the supplied `error`
functions. In this way, the error value can be explicitly typed in a way
that is consistent with what subscribers of the container or supplied
state can expect based on the type of the token. So, if some aspect of
the storage mechanism needs to handle exceptions then it should do so, but
then explicitly set the error value via the `error` function.

Furthermore, if input state containers need to do some sort of validation,
then this should be represented as either derived state on the input value,
or, if that's not possible, as part of the input state value itself -- through
a type like `Result` or something, for example. Meta state is *only* for
passing information about the status of the value with respect to the storage
mechanism; it is not for representing anything about the meaning of the value
itself.