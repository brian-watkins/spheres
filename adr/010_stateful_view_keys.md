# Keys on Stateful Views

Our current strategy for rendering stateful views is to wrap them in
a *virtual* node called `view-fragment`. This virtual node itself has
no particular data associated with it. So, to Snabbdom it just seems
like an empty element. Under the hood, We switch out the reference to
the DOM element that the `view-fragment` keeps and so this means that
when Snabbdom decides to add the `view-fragment` to the DOM or remove
it altogether, it's really removing the stateful view.

There is a downside to this strategy. In situations where there are
many `view-fragments` all together -- like in a list -- and this list
is getting rearranged or even just added to, Snabbdom will end up
doing weird things because it has no way to distinguish any of these
elements from each other.

The typical approach to fix this is to add a `key` to each virtual node.
This provides a basis for Snabbdom to distinguish each node and also
reorder them efficiently if necessary -- The use of a `key` is usually
done to improve the efficiency of list operations in the DOM I think.

If we add a distinguishing `key` to the `view-fragment` node, then
everything works just as expected. The question is: What is the best
way to specify such a `key`?

#### 1. Pass in a key via the `withState` function

When we create a stateful view, via the `withState` function, we would just
supply some key whenever we need to. This works but is a bit verbose and
it's not clear it makes sense from an API perspective. The function name
`withState` doesn't indicate that a new element is being created (and it's
not -- only a virtual node) so what would a key apply to anyway? Furthermore,
if you have a list of state and are creating a stateful component for each one
then you may have the information you need to set the state only *inside* the
`withState` generator function. You don't want the parent to necessarily
depend on state that only the child component actually needs. (Consider the
case where the parent is looping over an array of `State<T>` objects).

#### 2. Have a unique id for every state

Perhaps, then, we just create a unique identifier for every state and use
that as the key so the user needs to do nothing at all. Presumably on this
case the virtual node would use the unique id of the `State<View>`. But
this won't work. When Snabbdom needs to diff changes, it will end up
generating a new `State<View>` and try to compare that against the existing
one, but the new state will definitely have a different unique id and so
they will always be different. The update to the DOM will occur as expected
but Snabbdom will be doing too much work, basically deleting all items
and recreating them.

Note that `State<View>` is derived from other state. So we could generate
an id for derived state that is based on the id of the state it depends on.
This won't work though, since any state with the same dependencies will then
have the same id and appear the same to Snabbdom. But in a list, probably
each item depends on the same state.

#### 3. Subscribe and unsubscribe immediately trick

What we need to do is allow the stateful element to tell us what the key
for the view-fragment should be. If you have an array of `li` elements, it's
more natural to put the key attribute on those items. So, if that is the
top-level element of the stateful view, then the `view-fragment` should just
use that as the key.

It turns out that on our current implementation, subscribing to state is
synchronous and the callback gets the initial value. So, in the `withState`
function, we could subscribe to the state, capture the initial value in a
closure and use the key from that value.

This does work, but it's hacky and relies on the subscription callback being
called synchronously and immediately. There is a world in which we consider
notifying subscribers of changes via microtasks and that would break this
implementation. So this approach seems too brittle.

#### 4. Avoid wrapping repeated items in withState

One option that's always open is to keep the repeated dom elements out of the
`withState` function, and then just use a key attribute on those repeated
elements like normal. So, if you had an array of state, you would map over them
and create an `li`, each with its own unique key, and then call `withState`
for the *child* of that `li`.

This does work, but it means that the programmer needs to remember this pattern
and sometimes it might be awkward to implement things this way.

#### 5. Have derived containers return initial state upon creation

What we need is to know the initial state of the `State<View>`. And we know
that this is a derived state, since it's generated with the `withState` function
which just takes a derivation function. You could create a `State<View>` as
a container but that seems weird.

We can change the API when we create derived state so that it returns the
state object *and* the initial, calculated state. That way, we can get the initial
state in a non-hacky, non-brittle way, and use that to get the key of the top-level
element from the derived stateful view to use as the key for the `view-fragment`.

Even though that complicates the API for the loop a bit, we generally expose
simplified functions that interact with this API and so a programmer won't
notice the change.

### Decision

We will go with Option 5, and note that Option 4 is always a viable path as well.

To make it a bit easier to set keys, we will implement a `toString` function on
`State` that returns a unique identifier for each state. We will also change the
`key` attribute function so that it can take a `State<any>` as its value and
will use the `toString` method to get a unique id for that state. In this way,
programmers can just use some state object itself as the key, without having to
get its value and decide what property to use.

So, ultimately, the `view-fragment` virtual node, will automatically use the
key attribute of the top-level element of the stateful view, which seems like
a more natural approach.

### Caveats

It's still true that programmers might see errors or unexpected behavior
before they specify a key. This is not ideal. We could print out a warning
like React does when an `li` or some other list element is used without specifying
a key. But for us this will occur even with a series of `div` elements I think,
so it's hard to know when exactly we should print such a warning.