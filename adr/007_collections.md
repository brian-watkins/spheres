# Collections

Often application state can be modelled as a *collection* -- this means a list of
records or values. Think of a list of 'notes' in a note taking app, or a list of
cities in a weather app, etc.

Collections seem to be common enough that it will be beneficial to support
them explicitly. But we will implement collections as a plugin to the Loop so that
other custom data structures could be created to help model application state.

### Why Collections?

By defining a piece of state as a Collection, we have a few goals.

#### 1. Being explicit about changes

First, we want to be able to be
explicit about the *kind* of change we are making to the collection at any given
time. Instead of just updating the complete list of records, we should be able
to specify that a certain change 'inserts a new record' or 'deletes an existing
record' or 'updates an existing record'.

This helps us be more explicit in our modeling of state interactions. But the best
reason to do this is that it provides much needed context to any Writer that is
associated with the collection. In a RESTful API style, there will be different
requests that need to be made for creating, updating, and deleting resources. And
no matter what kind of API or how one is storing data, it seems helpful to know
the particular kind of change that is being made so that the proper actions can
be taken to store the updated state correctly.

#### 2. Better ergonomics for updating state

This is closely related to (1) but worth calling out. Consider how we might model
a collection using a basic container:

```
const listContainer: Container<Array<SomeRecord>>
```

Now, if you need to change that array, say in response to a user clicking submit
on some UI form, then you need to send a write message from the UI -- and this
write message needs to contain *the entire updated array*. This means the code will
need to have the logic for updating the array as part of the code to generate the
message. This is certainly possible to do, but feels like just more for me to
figure out when as a software writer in that moment, I just want to focus on the
fact that 'I need to insert an element into this array'.

If we model this as a collection container, we will have a set of messages we
can use to update the collection in a more specific way. We'll call these
`CollectionMessages`

```
const listContainer: Container<Collection<SomeRecord>, CollectionMessage<SomeRecord>>
```

So now, as a software writer, I can just say 'send a message to insert this record
into the container', instead of also writing the code to figure out *how* to do that
right there in the UI.

### 3. Local first development

We want our software to work as much as possible, without needing to depend on a Writer
or Provider being defined.

The risk with decoupling state representation from state storage is that some of the
representation logic starts to leak into the storage mechanism. For example, if we /need/
a writer to be associated with some container in order for that container to get
the proper value to store. (because the writer generates that value or something like
that).

So, the update function will be specified as part of the container definition, so that
as much logic around state representation is kept out of those things that handle storage
(ie a Writer). And then even if no writer is installed, the insert or delete or update action
should still just work on the container (given the appropriate messages). And so one could
theoretically operate just fine with 'in-memory' storage.


### Implementation

We want to implement Collections as a kind of 'plugin' to the loop, that is, in such
a way that one could write other data structures that have the property of being
easy to be explicit about changes.

In order to implement collections, we need to distinguish the type that a container
holds from the type of value that it should receive when we send a write message to it.
Previously we have made these types the same so that ever write message was basically
saying 'overwrite the value of the container with this new value'. But if we distinguish
those types we have an opportunity to provide more specific information to the
container as part of the write message.

In addition, we need to tell the container how to process these incoming messages. And
so when we create a container, we need to not only provide an initial value, we also
need to provide an *update* function that takes the incoming message, the current
value of the container, and then produces a new value for the container.

The basic type of container can be described on this new view by having the same type
for the container value and the container message. And then the update function we
use is just:

```
(val) => val
```

In other words, the update just takes the incoming value from the write message and sets
the container value to this new value.

For a collection (or anything else custom), we would provide a more complicated update
function that switches on the type of the incoming message in order to do the right thing.

Note that this update function is the *final* step before a container value is refreshed
and subscribers are notified. So, if there is a writer associated with the container, then
it will recieve a write message with the custom message value. This gives the writer the
best information about the kind of change that is being requested. It can do whatever it
needs to do to store that particular kind of change. And then it passes on the custom
message value (perhaps modified in some way), which triggers the update function, which
modifies the container value and notifies the subscriber.

### Caveats

Right now, for a collection, we're defining a set of `CollectionMessages` with common
actions like insert, delete, update, reset, etc. One worry is that these might not give
the right level of customization. For instance, on an insert to a collection of `Notes`,
maybe I don't want to insert a `Note` because when I create a new note it doesn't have
an id yet until it's been stored on the server. So instead I want to insert a `NoteData`,
but then the writer will get the id and create a new `Note` that should then be stored
in the collection. We'll have to consider if the CollectionMessages we define can
support this kind of use case, where the UI might send data in formats other than what
will ultimately be stored in the container. The same point is true of a delete -- do we
want to send the entire note or just the id? Should the id type be a generic parameter
on CollectionMessage?

This problem around inserts could be solved by having the id field (or whatever parts
of the note need to be server-generated) be optional ... so when you create a new record
this field is null. That's maybe not the best way to model data, though.

Alternatively, the id could be set on the client side. Perhaps itself being some kind
of container that provides a sequence. That seems pretty wild but could be interesting
to consider. It would be a new thing, though, to have a server provide a sequence
number -- since this is usually something that a database will do for you.

How we insert into a collection when some of the properties of the record are generated
on the server-side is a tough question we need to consider ...