# Unsubscribe from State

When effects are subscribed to state we generally don't have to worry about
unsubscribing these specifically because most of the time we don't actually ever
need to unsubscribe them at all, since they just stay around for the life of the
application.

What we do need to handle is what we might call conditional
subscriptions. These are subscriptions that only occur when certain conditions are
met. We can use the current strategy of a version number to handle this case
without needing to store a list of subscribers and keep that updated anytime
any state changes. For conditional subscriptions based on version number
tracking, and effect is actually on unsubscribed only when the state is
updated again after the effect as unsubscribed by setting its version to
a lower number. This leaves a problem however in that, if the state never
actually updates again the effect will never be unsubscribed. And thus
we have a memory leak.

In fact, we see this problem, a lot with lists and probably also switch
views. Unlike other views, the views that compose a list will often
be deleted or otherwise removed from the DOM. And in those cases
you want the subscriptions attached to those views to be deleted immediately
since otherwise, the dumb elements might just stick around and take up the memory.

So the problem we're trying to solve here. Is that when items in a list
are removed if we don't unsubscribe them immediately then it could be the case
that they retain a lot of memory. For example, consider a user token.
This would store information about the currently logged in user
and it would probably not update very often during the course of the application.
If there is a list with views that each reference the user token
And this list updates a lot so that the views are deleted and new ones are created
Then, even if the version number of these views is different because
They have a reference to the user token, and that user token never updates
None of the effects that reference the user token will ever be sufficiently
unsubscribed and deleted. So in other words, they will retain the memory.
of the Dom elements they reference, which is bad.

For this reason, we need a way for view effects especially to unsubscribe
immediately when thst list view item is removed from the DOM.

### Approach

We already set things up so that each list view item has its own
overlay token registry which effectively treats the internal state used by each
list item as distinct (the item state, index state, and any tokens
defined in the view).

To implement this, we basically create a new state publisher
For each internal token for each list item view. This allows for tracking
subscribers of this state in such a way that it will be thrown away
if the list item view is deleted.

For this internal state, the state publishers involved are all internal
to the token registry associated with each list item view. So if the list updates
and that list item is removed then eventually all the state publishers and so on
will be garbage collected.

For external state, we have to do something different. We want to allow subscriptions
to state external to the token registry in such a way that it is easy
to unsubscribe subscriptions for a particular item should it be deleted
from the list.

So for each external state token, we create a listener that will be updated
if the external state is updated. And this listener itself maintains a map
from the virtual list item to a state publisher. This state publisher
maintains a set of subscribers to that external state for a particular
list item. And the value of the state publisher is taken from the
external state. This allows this state publisher, which we'll call
an overlay state publisher, to mimic the external state (by which I mean
it can be written to during event handling and returns the value
of the external state) but all the while maintain a distinct set of
subscribers on a per list item basis.

So with this in place if a list item is deleted then we iterate over
all the tokens and delete the subscriptions associated with this
particular list item. Finally, we check in if there are no more subscriptions
for this token at all, then we unsubscribe from the external token
the one subscription that the list effect was maintaining.

### Caveats

#### User-defined effects

Note that this discussion is really about what we might call "system effects"
namely, the effects that spheres implements to update the DOM. For user defined
Effects we track dependencies, explicitly for each effect and this
Allow allows us to unsubscribe immediately from those dependencies
Whenever we need to. We don't use this approach when updating the DOM
so the performance implications aren't really tracked, but it works.

#### Slow Unsubscriptions from per-item tokens

We make an assumption here that each item is probably subscribing
to the very same external tokens. That's why when a list item is deleted
we just iterate through ALL external tokens the list effect is tracking
and unsubscribe this item from each of them. This makes it so we do not
need to track which external tokens are subscribed to for each
item in the list which will be a lot more stuff to keep track of.

However, if each item creates its own external state, then we will end up
unsubscribing each list item from all these external state tokens
that really each only applied to a single item. If the list is large, this means
on every removal of an item, we unsubscribe from a whole bunch of state,
which is slow.

It's not totally clear what we should do about this except to keep a
list of external tokens on a per item basis. This would mean adding a new map
to each virtual list item, which itself would have performance implications.
However, at least we wouldn't have to track dependencies on a per effect basis,
as this would track state at the overlay registry level that all the effects
for a particular list item share.

[Note: we implemented this change and it results in better performance
overall for cases with per-item external state, and doesn't seem to
degrade performance for other cases]

#### Other cases

A switch view is the other case where views can be added and removed
from the DOM throughout the life of an application. For this reason,
we probably need to implement the same or similar approach for switch views.