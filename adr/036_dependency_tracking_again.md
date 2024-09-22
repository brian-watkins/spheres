# Tracking Dependencies - Revisited

In [this adr](./033_dependency_tracking.md), we described an approach
to tracking dependencies that obviated the need for each effect or derived
state to track its own dependencies explicitly. We described an approach
where we could lazily unsubscribe depedencies to prevent extra work while
still prventing glitches.

This approach works but one downside to the implementation was that each
`ReactiveEffect` was wrapped in a new object -- a `ReactiveEffectController`
that stored state and did the necessary updates as part of the `notify`
and `update` stages.

Through investigations, we learned that creating these new object instances
seems to slow down performance, especially when creating many repeated
view elements with several effects. If we could do things differently so
that we did not need to create a new instance for each effect, that should
result in a performance improvement.

### Decision

Instead of creating a new object to store state, we will simply add some
'hidden' properties to the `ReactiveEffect` interface so that we can store
state directly on the object that implements the interface. To do this, we
will use a `Symbol` that is not exported for the name of the properties.
This allows us to prevent any possible name collisions, and IDE's will ignore
these properties.

This allows us to avoid creating a new object instance. But we can simplify
the algorithm for running dependencies in the correct order (to prevent
glitches) further.

Instead of tracking a count of dependencies (as described in the ADR
referenced above) for each effect or derived state and then only executing
the effect or calculating the state when the number of dependencies has
reach zero, we can accomplish the same thing by just tracking the `parent`
of each effect (or derived state). The parent is a reference to one of the
dependencies of the effect or derived state. 

So, we first traverse the dependency graph in depth-first order. As we do so,
we set the parent reference so that at the end of the traversal, each effect
has a reference to the *last* dependency that will be calculated in a depth-
first traversal.

Then, when we traverse the dependency graph again, for each dependent child,
we check to see if its parent is the node we are on. If it is, then we run it.
If not, then we just skip it for now because there must be other nodes that
need to update before this one.

So the algorithm traverses the dependency graph twice and looks like this:

#### Notify pass
1. Traverse the dependency tree in depth-first order.
2. For each child node, check to see if its version matches the version with
which it was registered as a listener for this node. If the versions do
not match, unsubscribe the child node from this parent. If the versions match,
set the `parent` field of the child to this node
3. Continue to 1 for any dependents of this child.

#### Update pass
1. Then traverse the dependency tree in depth-first order again.
2. For each child node, if the parent matches the current node, then run the
effect. If not, continue to the next child.
3. Increase the version number for the child node, in preparation for running it.
4. Run the node. As the child node references other nodes, it will be subscribed
to them with its new version number.
5. If a child is derived state, it will check to see if its value has changed.
If so, it will go to 6 for each of its child nodes. If not, it will stop the
traversal. Effects have no children so the traversal will stop there.

### Caveats

This approach seems to work -- all the tests pass. We still need to do two
passes of the dependency tree, even if the second is somewhat optimized. So,
there are still potential optimizations we could explore.