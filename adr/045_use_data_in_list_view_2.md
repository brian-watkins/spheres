# Use Data in List View Revisited

[This ADR](./043_use_data_in_list_view.md) explains an approach for accessing
list data in list item view functions while remaining performant and safe (ie
ensure that any tokens passed to the view function were stable and could be stored
and accessed later). We ended up optimizing this a little further in order to
make it easier to work with while achieving the same performance and safety
benefits.

Instead of having the `useData` function provide access to state tokens that
reference item data and index and which could then be accessed via the 
`GetState` function, we simply have the `useData` function (now called
`useItem`) return the values for the item data and index themselves. This
makes it much more natural to work with these values in the list item
view function. A few things make this possible.

1. We don't actually subscribe to changes in list item data. If the data changes
in the array that governs a list then we will simply recreate the element
rather than trying to just update subscriptions that use the list item data. We
need to do this anyway I think because we use the data itself as a key for the
dom node. So in the `useItem` function we can just get the data for this list
item and then provide it directly to the caller, which means that there's no
worry about whether to store it or not (since it's not a state token). But still,
that data is only available *inside* a reactive query so it can't be used to
construct the template function itself.

2. For the index, we actually do want to subscribe to a publisher in this case
so that when items are rearranged we can update subscribers to the index. But
we do not want to automatically create subscriptions for performance reasons. So,
we have the `useItem` function actually take as its argument an object with a
getter for the index and when the index is accessed we create a publisher and
subscriber to it. But still the caller only gets the index value, which is safe
to store.

We accomplish this by creating a special list data reader object. This knows about
the item data and the item index. And to reduce allocations we provide this object
itself as the argument in the `useItem` function. List item view functions that
use the `useItem` function will get a state reference that is used (behind the
scenes) to get the list data reader object for a particular list item. When that
happens, it gets a subscriber to register as a listener for changes. But since
we don't care about registering subscribers for data updates, we simply hold a
reference to that subscriber in case the index is referenced. When it is, we
use add that subscriber to the index publisher. Since the subscriber itself is
an effect owned by this list item view there's not a problem with memory -- the
reference to the subscriber in this case does not prevent garbage collection
because the list item data reader is owned by the list item itself (when it is
removed, then the reader will be garbage collected and so on).

This pattern also mirrors what we've done with the select view. There, a
`useCase` function is provided so that view functions for each selection (in the
case of a discriminated union selection) can get access to the discriminated
value.

So this makes for a better dev experience -- access to the item data and item
index is direct, no need to call `get(item)` etc. And the benchmark shows that
the performance is the same.
