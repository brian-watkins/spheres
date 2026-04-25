# Register hook for view tokens

Because Spheres separates storage details from state logic, if
we want writing to state to have some effect outside the application
(like persistence) then we need to attach a container hook to that
token in the store which allows us to intercept write messages
and cause storage effects. Typically this can be done when
configuring the store by referencing tokens directly that need to
be persisted. However, not all containers are defined as top level
exports. In particular, some containers are defined inside view
functions and, importantly, inside view functions that serve as
templates for lists and conditional views.

In order to define storage logic or other side effects for these
containers, we need some way to know when they are registered with
the store. The `onRegister` store hook allows us to accomplish that
in general. And inside this hook, it's possible to call `useContainerHooks`
to then intercept write messages to these containers.

The challenge with implementing this feature is two-fold.

1. Containers defined inside list item views or conditional views is that
these views are governed by their own (overlay) token registries. This
allows, in the case of list views, for reusing the same tokens in each
list item view but storing different state values. However, since these
do not use the main token registry explicitly, we need to find a way to
still alert the main token registry when a container is being registered
so that the `onRegister` hook can fire.

2. Container tokens defined in list item views will be reused across all
item view instances. Each item view effectively has its own container state
but the token used is the very same (for memory and performance purposes) so
from the outside it could look like the container in this case is being
registered only once when actually it should be registered once for each
item view that is rendered.

These challenges really only apply for containers defined inside list item
views. Conditional views do use overlay token registries, but tokens are not
reused across conditional views and so they work just like a container defined
inside any normal view function. So, inside the overlay registry, when the
token is first referenced, we get its state handler from the parent registry.
This will ultimately bubble to the root registry -- because if this conditional
view is nested within another view, that view's overlay registry should not
know about this token and will just have to continue to ask the parent registry
to resolve it.

For containers inside list item views we will do two things:

1. To make sure that the `onRegister` hook is called for the container in
each list item, when this container is referenced we will create a *clone*
of its token, generate a state publisher, and then set this on the parent
registry. We add some logic to the root registry so that if a token is set
on the registry for the first time then the `onRegister` hook will be called.
This works it doesn't matter whether the token provided to the `onRegister`
hook is the very same object as that defined in the list item view function;
all that matters is that it refers to the same state publisher.

2. The other challenge has to do with how we identify these container tokens
when they are called on the hook. One might worry that a list item container
token would need to be individuated in some way when it's associated with
one list item versus another. We considered adding an `id` attribute to the
container that could store some state token that could reference the
list item data. However, that seemed like we were adding a new attribute to
all containers just for this one use case, which probably will not actually
get used all that often. Instead, we landed on allowing the initia value of
a container to be defined by a query on the state governed by the registry
with which the container is registered. This gives us the ability to include
some data inside the container value that would identify it within a list
(like the index or the list item data, etc), if that is really needed. It
also makes the container state more flexible without changing the api surface,
which seems like a good thing.

### Caveat

It's unclear whether there's a need to know when containers defined inside
list item views are registered. Are there cases where we might want to
persist the values of these containers or load their initial values from
data outside the application? Nevertheless, we have this capability now and
we've tried to implement it in a way that doesn't add extra cruft to the
overall api ...