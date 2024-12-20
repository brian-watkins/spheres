# State Internal to Views

One problem that comes up when using spheres/view is that the various
reactive effects (for updating text, attributes, events, etc) can often
repeat the same sort of code to get at parts of state. This is especially
true when dealing with a list, where one gets a `State<T>` and needs
to unwrap that to get at the data on which the list item is based.

Another problem is that sometimes a particular view might need some state
that only it cares about. In the case of a list, we might want to create
some state for each item in the list. But then it becomes difficult to know
how to create and refer to that state. It's possible to use an id of some
sort to get a particular container dynamically, but then this has ramifications
on memory since tokens with an id specified will not be garbage collected.

One solution to these problems is to support the ability to define state
within a view function -- and especially within those view functions that
are used to render lists.

### Decision

We will support defining containers and derived state within a view
function. With derived state, one can abstract some repeated code into a
single query that can be reused in multiple reactive effects. And with a
container, one can store state on a per-view basis.

### Implementation

One trick to implementing this is the fact that view functions associated
with lists will be evaluated only once to produce a 'template'. So the very
same state tokens used in that view function will be refereneced each time
the view is used to render another element in the list. This has always been
true of the 'item token' and the 'index token' but now that we support
defining other tokens inside a view function, it will be true for them as well.

Previously, we had an object that maintained a reference to these tokens (we
called it the 'ArgsController') and we ran code at the beginning of each
reactive effect's 'run' function to set the value referenced by the token for that
particular instance (of an element in a list). This worked ok but it would be
more difficult to do with user defined tokens in the mix.

So, we moved to a different approach. The cool thing about the state token pattern
is that a token does not itself hold any state (other than the initial value in
some cases). It's only when a token is associated with a particular store that it
comes to reference some value. And the same token can be associated with multiple
stores and thereby represent a different value in each case. This is just what we
need. Each view (template) function has some set of tokens (in the case of a list,
the item token and the index token plus any user-defined tokens). For each instance
of that template function (eg to render an element in a list), we need to
(basically) create a new store that will hold the values for those tokens relative
to that template instance. We'll call that new store an 'Overlay Store' as it will
track only the tokens that are defined for that particular view template. When
an effect runs against that store, it will check to see if it tracks the given
token. If it does, it will return the value, if not it will forward the request
for that token to its 'parent' store. This parent store is usually the store
created when rendering the view, but it could also be another Overlay Store if the
view is nested inside another templatizing view (another list or select view).

### Caveats

We did some refactoring to make these Overlay Stores relatively lightweight to
create, since we will be creating one for every instance of a template view. But still,
we are creating a new Overlay Store instance every time we render an element in
a list, which could be a lot of object creation.

Nevertheless, overall this approach seems to work well. It simplified lots of code
-- we don't have to remember to explicitly set the value of a token before an effect
runs, for instance. And it turns out that we don't really need to do anything for
select views to support this pattern. And it seems to have the same performance or
maybe slightly better performance than the previous, more complicated approach.