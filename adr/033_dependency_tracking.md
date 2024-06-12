# Tracking Dependencies

Any state can have subscribers/listeners which update whenever that state
value changes. These subscribers/listeners can be other state (derived state)
or reactive effects. In addition to this 'subscriber tracking' we also need some
way for derived state or reactive effects to track their *upstream* dependencies
as well. Why? 

1. To prevent glitches. We need to make sure that all dependencies have updated
their value *before* we update derived state or run a reactive effect. Otherwise,
we could propagate state values that are 'in-progress' of being updated (glitches)
or run effects multiple times.

2. To prevent extra work. If derived state or a reactive effect has multiple
dependencies and under some conditions one of those dependencies is not longer
relevant for the calculation, but the derived state or reactive effect is still
subscribed to that irrelevant state, then when that state updates, the derived
state will be recalculated and the effect will run again -- but the value will
be the same since that state is irrelevant. This is extra work ... but in the
case of a reactive effect which can have side effects it could lead to unexpected
or bad results.

To address (1), we had originally used an approach of allowing derived state to
recalculate but deferring reactive effects until the next run loop via
`queueMicrotask` -- see [ADR 30](./030_glitchFree_effects.md). While that worked,
it seems less than ideal in general and also was increasing the time to do updates
unsatisfactorily.

To address (2), we had originally had each derived state or reactive effect kept its
own `Set` with references to its dependencies. Prior to each recalculation, it would
iterate over this set, unsubscribe itself from each dependency, clear the set, and
then recalculate (which would subscribe again to the relevant dependencies) and store
the new dependencies for the next recalculation. This works but it does use memory
to store these dependencies and also takes time during the update cycle to do the
unsubscribing and resubscribing. So if we could avoid that, it would seem to be good.

### Decision

We will take a different approach, which we'll call the notify and update approach.

Suppose that some state value changes. We will follow this algorithm:

1. For each subscriber, call `notify` on that subscriber and pass in the `version id`.
2. A call to `notify` will return true or false based on whether the subscriber
accepts the update.
3. If the update is rejected, then unsubscribe this subscriber and go to the next
subscriber.
4. If the update is accepted, go to the next subscriber.
5. If a subscriber is itself derived state (ie if it also has subscribers) then when
it is notified, it will notify all its subscribers immediately.
6. Each subscriber will track the number of times that it has been notified.
7. Once all subscribers have been notified, then we loop over the subscribers again
and call `update` and pass a flag based on whether the value of this state has changed.
(Of course the original state has changed, but it could be true that derived state
does not change its value as part of this update)
8. Each subscriber will wait to decide whether it needs to update until it receives
an `update` for each `notify` -- at this point it will know that all its dependencies
have updated their values and it is safe for it to update its value.
9. The subscriber will then update its `version id`.
10. If at least one of the dependencies has changed its value, then the subscriber
will change its value (or the reactive effect will recalculate). As part of this
process, it will subscribe to any state it needs to with the newly updated version id.
11. If the subscriber itself has subscribers then it will call update on them and
pass a flag indicating whether its value has changed.

Following this process, we solve our two original problems in a different way.

(1) We avoid glitches, since each subscriber will wait to update until all of its
dependencies have updated. And we don't need to defer reactive effects via
`queueMicrotask` or recalculate derived state.

(2) We avoid extra work because when we allow each subscriber to decide whether it
should still respond to updates for a particular dependency. We do this by comparing
the current version id with the version id used when subscribing to the dependency.
If they are the same, then we know that the dependency is still relevant. If they are
not, then we know that the dependency was relevant on some other earlier version of
the calculation and so can be ignored. We then unsubscribe from it for the future.
This allows us to solve the problem without needing to unsubscribe from all dependencies
on every single update or keep a set of references to dependencies around all the
time -- we just need to store the version id. This improves memory usage primarily;
it doesn't seem to affect update performance in a significant way.

### Caveats

The approach to solving (2) involves *lazily* unsubscribing from irrelevant dependencies.
That is to say, we will only actually unsubscribe from this dependency when its
value updates and we attempt to notify a subscribe that no longer needs it. This
potentially could lead to memory problems since (of necessity) state holds a strong
reference to each of its subscribers. We have not seen any memory problems as part
of the benchmark suite. Indeed, on this approach, the memory is decreased by over 5%,
especially when creating 10k rows.
