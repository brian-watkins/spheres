# Reference a Container via a string id

Typically, a container is defined and a token is exported from a module. All
references to that container occur via references to the generated container
token, and when there are no references to the container token, the container
itself can (eventually) be garbage collected by the JS runtime.

But in some cases, it might be necessary to create a container at runtime. In
this case, we cannot (I think?) refer to it via a token that is explcitly
exported from some module. For example, a spreadsheet
application might need to have a container for each cell, but it would be
impractical to create each cell container explicitly and export it from
some module. Or, maybe there is a dynamic list of items, each of which can
be updated, perhaps these could best be modelled by creating a container
for each item in the list as necessary.

In some of these cases, at least, it's often important to refer to those
dynamically created containers later on. One way to accomplish this would
be to keep a map with some identifier as a key, so that it would be possible
to look up the associated container by that identifier whenever it was needed.

While it is possible for the application write to create this map and
manage it, we will allow the store to do this tracking itself, when necessary. We
will add an `id` field to the container initializer. When it is present, any time
a new container is created (via the `container` function) with this same
id specified, the token returned (which will itself be a distinct object) will
map to the very same container controller inside the store. In this way,
even though the tokens may be distinct objects, they will be cashed in for
the same container.

We also need to track store registry identifiers for Meta state in such a way that
it works with containers that have string ids. We do this by keeping a static WeakMap
from the registry key of a container to a key for its meta container, which is
always just a raw object. And then when we need to find the meta controller we look
it up based on the token for which it is a meta token.

### Caveat

Note that if we create a container with an id, we are also implicitly
saying that this container will *never* be garbage collected. By associating the
container with a string id, we say that it *must* always be available any
time we ask for a container with that id in the future, no matter whether there
are any references to a token associated with it.
