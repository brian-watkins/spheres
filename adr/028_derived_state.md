# No Reducer in Derived State

In [this adr](./016_query_and_selection.md), we decided to add a reducer
to the `Value` state. This was to enable use cases where some readonly
value was calculated by the storage mechanism based on details obtained
via a reactive query. There were problems with that, which were discussed
in [this adr](./025_commands.md), namely, this required derived state to
have storage hooks (which doesn't really make sense) and also potentially
deal with messages in its reducer that it could not handle locally (without
storage hooks attached).

To support the use case without these problems, the `Command` and
`SuppliedState` concepts were introduced. Now that these concepts are in
place, there's no need for derived state to have a reducer. It's definition
function can handle any necessary transformation of the value.

## Decision

We will rename `Value` to `DerivedState` to be more explicit. We will also
remove the reducer function from `DerivedState`. This means that `DerivedState`
will always be a `State<T, T>`.