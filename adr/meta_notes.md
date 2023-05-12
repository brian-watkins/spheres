# Meta containers

We need to write an ADR explaining the approach with meta containers.

Basically, they are for the purpose of indicating the state
that some data is in -- ok, pending, error. 

Right now we've tried to say that each of these states should
carry some data about the message (M type) that is associated with
the container in question. So the `ok` message would hold the
current message for the container. and `pending` would hold a pending
message and `error` would hold any error. And if the message written
to the meta container was `ok` then that would be passed on to its
corresponding container.

One problem with this: There's now an expectation that the meta
container -- if it is in the `ok` state -- should contain the
current value of the container. But in fact we don't ever update
the `ok` state except via a provider or writer. Furthermore, in order
to keep the types correct, the Meta container needs to take in M types
and pass on M types. But when we create a container we provide a T
type as the initial value and were storing that in the Meta container
as `ok(T)`. This didn't make sense from a type perspective. But when
we fixed it we had to introduce another Meta message type:
`initialValue(T)` which doesn't seem very valuable.

To fix all this, I think we could try the following:

Make the Meta messages be like this:

```
ok()
pending(M)
error(M)
```

That way, no matter what the value of the container, if it's ok then the
Meta container will just say it's ok. And we can still pass information
via Pending or Error messages. Indeed, these don't even really need to be
M type ... I think there could be distinct types for Meta containers in
this case.

But now, what do we do about writers and providers, which have a `set`
function that updates a Meta container? How do we set the value there if
we aren't passing a value via `Ok`? I think we need to change those so
that the `set` function is allowed to update the value of any `State`.
AND we change the basics of a `State` object so that if a value is
(to be) published AND there is a meta container in the registry, then we
update the meta container's value to be `Ok`. 

When we create a Meta container initially, it's initial value would just
be `Ok`.

So this might mean a writer would have to do something like:

```
write((get, set) => {
  set(token.meta, pending(blah))
  // do something
  set(token, someValue)
})
```

Which seems better but we don't get the automatic connection between a writer
and some particular token. Maybe the writer would need to have `set` and `update`
functions or something? Or even `set` and `ok` to be able to update the meta
value and then update the container.

A provider could stay the same, I think, since it already has a `set` function
that allows it to update any state ... we would just change it to set a
`State` token rather than a Meta state token ...