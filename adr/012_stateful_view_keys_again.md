# Keys on Stateful Views - Revisited

Our implementation of stateful views treats them as 'opaque' within
the virtual dom. This means that from the 'top down' the virtual dom
simply sees a `view-fragment` element with no properties. Within that
element, a new virtual dom fragment is managed and updated when the
relevant state changes. This is cool but causes problems when dealing
with lists of stateful views, since the virtual dom has no way to
distinguish these from the 'top down'. This means that if the views
are reordered then the virtual dom won't do anything since they look
the same to it.

The way to fix this is by giving the `view-fragment` element a `key`
property when necessary. And in order for this to work, it must be
the case that when a new version of the virtual dom tree is created
(in order to determine if patching is necessary), the elements in that
tree must already have their keys set. In other words, we cannot assign
a key by way of a hook because hooks aren't applied until patching
actually occurs.

In an [earlier ADR](./010_stateful_view_keys.md), it was decided to
implement this by (1) getting the initial state of a stateful view
each time the virtual dom tree is created and (2) using the `key`
property of the top-level node in that view (if it exists) as the key
for the `view-fragment` element.

This works but has a bad side effect that we didn't realize: On this
implementation, each time the virtual dom tree is created, a *new*
derived state will be created. This state may not be used or subscribed
to, but it still is created and added to the loop registry. Then as
state changes, *all* these derived states will recalculate, even if they
have no subscribers. This means that as the view updates, more and more
calculations will need to occur. This seems like a very bad thing.

We considered a few options to fix this:

#### 1. Caching the stateful view based on the derivation function

We could implement some memoization in the `withState` function, so that if
it is called more than once with the same function it will return the
very same value. We were able to get this working, but only in the case where
the passed in derivation function was defined and had a name. Only then would
the JS runtime recognize it as the very same function object. If an inline
function was used with the `withState` function, then a new function instance
would be created each time the `withState` function was evaluated and we
weren't able to trigger a cache hit.

It seems like too much to tell people not to use inline derivation functions
with `withState`, so this doesn't seem like a good options.

In addition, it seems like in a list of stateful views, they could very well
all be derived from the same (named) function. But then `withState` would
always return the first view instead of each view in the list. We didn't
attept to verify this but seems like it would be a problem.

#### 2. Caching derived state in the loop

Perhaps there could be some caching done at the actual loop layer. But this
would be subject to the same problem as (1), where if there are multiple derived
state objects defined by the very same derivation function, then only one would ever
be returned. We want to be able to allow for this behavior of generating distinct
pieces of state that are defined in the same way but independently tracked.

#### 3. Supplying a key to the withState function

The most straightforward thing to do is simply to provide some key to
`withState`. The reason we decided against that in the
[previous ADR](./010_stateful_view_keys.md) was basically due to ergonomics:
it seemed kind of awkward to supply a key to that function -- plus it seemed
like the data used for that key would only be available inside the derivation
function (where we would have access to the state value).

However, one thing we did as part of the previous implementation was to make
it so that a state object can actually be used as a key (because under the
covers it has an identifier associated with it). So we should just be able to
pass whatever state object we will use inside the derivation as the key to the
`withState` function in most cases.

To make this a little better, we can provide some function overrides for the
case where someone does not need to set a key.

### Decision

We will go with (3). It is the simplest approach and isn't all that bad from
an ergonomics perspective.

### Caveats

Because we introduced the ability to get the initial value of a derived state
when creating that in order to achieve the previous implementation, we should
be able to remove that capability now, so that one gets the value of derived
state only by subscribing to it. However, the HTML string renderer still uses
this functionality. We would need to rewrite the renderer to be async probably
in order to leverage subscriptions to get the contents for `view-fragment`
elements.