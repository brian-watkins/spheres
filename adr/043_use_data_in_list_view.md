# Updated Api for List views

When rendering lists of views (via the `subviews` function),
a function was supplied that took one or two arguments -- these
arguments being `State<T>` -- a state token representing the
data for this item in the list -- and `State<number>` -- a state
token representing the index of the data in the list. This worked
fine for allowing state view effects to subscribe to updates
on the associated data (or index).

However, there was one big
problem: the token for the list item data was not /stable/ in the
sense that if it were stored in a container, when it was later
fetched from that container and evaluated, it would evaluate to
whatever value was provided by the current overlay token registry.

For example, if there were two items, and we stored item 2 in a container
but then when some event happens to item 1 (like clicking a button within
item 1) and we read the state token from the container, then that state
token will evaluate to the data at item 1, since item 1's overlay registry
governs state resolution for events the originate within it. 

The reason this happens is because the state token itself is /shared/
across all item views (or really instances of item view templates) in a
list. This is done for performance reasons and makes sense but it has
this downside, that the token will resolve to different values depending
on the registry it is fetched from.

This isn't so bad and in practice doesn't seem to cause problems ... but it
is misleading. And in those rare cases when one would like to store a
reference to the data at this position in the list, it simply can't be done.


### An Alternative

We want the data associated with a list item view to /only/ be accessible
within the view effect functions. Why? Because otherwise, that data could be
used to change the structure of the html for that item view and this would
make it impossible to store a template for the item view that could be
rapidly cloned.

One of the key assumptions of spheres is that the html is for the most part
static. And where the html does need to update, this can (always) be done in
one of two ways, each of which is governed by an effect -- a conditional
(switch) view and a list view. 

This is why we originally chose to have the item view function be one that
takes /state tokens/ rather than data itself. As we've seen though, this
causes some problems due to the way the list view is implemented for performance.

However, if we were to provide a `State<State<T>>` to the view function, then
it could `get(state)` that and have a `State<T>` that represents the data and
which could actually be a stable reference to that data because it could be
something the item creates rather than the token that much be shared among all
items. Indeed, each (virtual item) already creates its own state publisher
to hold the data (and subscribers) associated with that item, so there's little
cost to providing a distinct token that references this.

The downside of this approach is that now one would need to always write
`get(get(state))` to get the data associated with the item, which is the main
thing that one wants when creating a view for an item. Instead of asking
people to do this, we can provide a *function* that does this for them,
providing the state token and index token as part of a view effect function.
We'll call this kind of function `UseData`.

So, now, a list item view function is one that takes a single argument, a
`UseData<T>` function. And then this can be used anywhere a GetState function
is used like so:

```
function itemView(useData: UseData<Item>) {
  return (root) => {
    root.div(el => {
      el.children.textNode(useData((get, item, index) => {
        return `Item ${get(item).id} at ${get(index)}`
      }))
    })
  }
}
```

Where `item` and `index` are stable state tokens that can be stored and will
always refer to the same value. And, this data can still only be referenced
within a view effect.

This is a bit more verbose than the original approach but the benefit
(stable state references) outweighs the cost. And there doesn't seem to be
an performance penalty.

Behind the scenes, all that `useData` does is wrap the provided function in
a normal GetState function that fetches the stable item token (and index token
if necessary) first and then provides it to the wrapped function, returning
the resulting value. The fact that we call `get(sharedItemToken)` behind
the scenes allows this function to (basically) ask the item's registry to
provide the token it is using to track data and subscribers for this item.
It's that connection between the (template) view effect function and the
item registry via the `get` function that allows this all to work.

And `useData` can be used to access the item or index token anywhere we use
the `<S>(get: GetState) => S` pattern. So in derived state defined within a
list item view function. Or in the `use` function for an event handler, etc.

The other problem `useData` avoids is what we might call over-subscription.
If we were to do `get(get(state))` then this results in two subscriptions: one
to the inner state token and one to the one that wraps it (the shared token).
But `useData` optimizes this so that no subscription is created for the outer,
shared token. And view effects only subscribe to the 'inner' token that
references the data.