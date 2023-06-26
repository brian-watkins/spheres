# Selection Can Write to Any State

From [this adr](./016_query_and_selection.md) we have:

> We have two (main) types of state:
> - Containers, which can accept input,
> - Values, which cannot accept input (ie their values are determined
solely by their dependencies).

> We have two ways to model application logic via state interactions:
> - Queries, which are reactive
> - Selections, which are not reactive

> We have two analogous ways to model storage logic for state elements:
> - Providers, which are reactive and can write to any state
> - Writers, which are not reactive and can write to a single state

But, here, both selections and queries only write to one particular state,
which causes some limitations in what we can do to update state in response
to some user event.

Our overriding goal is this: We should only have to create a stateful
component in order to *present* some piece of state in the view. In other
words, we should not need to create a stateful component in order to
get data to update some piece of state in response to a user event.

We know that in certain cases we might want to do somewhat complicated
state manipulations in response to a user event. For example, consider
a list of items of which only one can be selected at a time. You
might have two pieces of state, one that holds the currently selected row
and one that has the rows with an `isSelected` flag. When you want to select
a row, then you would get the currently selected row, update that row to
be no longer selected, update the new row to be selected, and then update
the selected row state to record that fact. So that's three updates to three
different pieces of state that would need to happen. But when displaying
the selected row, all you need to know is whether the given row has the
`isSelected` flag.

### Decision

We will change Selection so that it returns any StoreMessage, which can include
a batch message that updates several different pieces of state.

And now we can update our description of how we can model state accordingly:

We have two (main) types of state:
- Containers, which can accept input,
- Values, which cannot accept input (ie their values are determined
solely by their dependencies).

We have two ways to model application logic via state interactions:
- Queries, which are reactive, and which write to a single state
- Selections, which are not reactive, and which can write to any state

We have two analogous ways to model storage logic for state elements:
- Providers, which are reactive and can write to any state
- Writers, which are not reactive and write to a single state

Selections are kind of like Writers except that they can write to any state.

#### Caveats

Should a query be tied to a particular state? Note that we do this now because
otherwise we would need a reference to the store in order to register the
query, and then query would be no different from a Provider. So, for now,
I think we leave query as it is.