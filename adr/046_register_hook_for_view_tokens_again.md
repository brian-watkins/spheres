# Improved hook registration for view tokens

[This ADR](./044_register_hook_for_view_tokens.md) describes an approach for
allowing the register store hook to be applied to containers defined
inside a list item view. Because container hooks were implemented via
wrapping the associated handler with a Proxy, this meant that the handler
in the store associated with a token had to be *replaced* and then the
item overlay registry had to fetch it again in case this had happened.
This, however, resulted in a potential memory leak since *getting* the
handler from the parent registry in a nested view would trigger that
parent overlay registry to treat the token as external state and thus
create an ExternalStateHandler which would subscribe but never be removed
if the nested item were to be removed. For this reason, it's necessary
to revisit how container defined inside list item views are made
available to the store register hook.

### Decision

We changed how container hooks are appled to state handlers. Instead of
using a Proxy (which requires the handler to be replaced in the token
registry with a *new* object), we just set a handler function on the
writer. In this way, adding a container hook *modifies* an existing handler
rather than creating a new handler to replace the old.

Given this approach, it's no longer necessary for the item overlay registry
to set the view token handler on the parent registry and then request
it again. By setting the handler on the parent registry (using a clone of
the original token as the key), we allow that to trigger the store register
hook -- which could then apply a container hook to it. And then that's it.
So the operation that triggered the potential memory leak has simply been
removed.

### Caveat

This approach does add a new branch to the write path for containers. It's
necessary to check whether a hook function is defined -- if it is we call
that, otherwise we just send the message to the typical write function.
This does not appear to affect the benchmark, but it does add a tiny bit
of additional work.