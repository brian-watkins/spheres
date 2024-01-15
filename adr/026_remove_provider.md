# Remove Providers

Originally, we had two ways to interact with the storage mechanism: Writers
and Providers. Providers were a reactive query that could get or set any state
(including derived values and meta values).

Providers had some downsides:
- They could set values for state that they shouldn't be able to (eg derived state)
- They were meant to be part of the storage mechanism but they were based on
a reactive query, which described a relationship among state -- which should be
part of the application logic.

Now that we have Commands that can be triggered by reactive queries, we have a
way to set up a reactive query that sets some SuppliedState and its meta values,
or even dispatches writes to the store. We also have queries on Containers so
that the value of a container can be updated by a reactive query. These approaches
allow for representing reactive queries *within* the application logic but still
provide some flexibility for setting state from within the storage mechanism, but
only for those pieces of state (Supplied State) whose values should be set in this way.

So we do not need a Provider, and the alternative approaches do not have any of
the drawbacks of using a Provider.

## Decision

We will remove Providers as a concept from the Store.
